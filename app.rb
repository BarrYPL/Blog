require_relative('modules/imports')

class HTMLWithPygments < Redcarpet::Render::HTML
  include Rouge::Plugins::Redcarpet
end

def hash_password(password)
  BCrypt::Password.create(password).to_s
end

def test_password(password, hash)
  BCrypt::Password.new(hash) == password
end

class MyServer < Sinatra::Base

  enable :sessions
  enable :inline_templates

  configure do
    if ENV['RACK_ENV'].nil?
      raise "The environment variable RACK_ENV is not set! Please set it before starting the application."
    else
      puts "You are starting the application in the #{ENV['RACK_ENV']} environment."
    end

    set :run           , true
    set :public_folder , 'public'
    set :views         , 'views'
    set :port          , 80
    set :bind          , '::' # IPv6 bind
  end

  configure :development do
    set :show_exceptions, true
    set :logging, true
    set :DB, Sequel.sqlite('db/test_database.db')
  end

  configure :production do
    set :show_exceptions, false
    set :logging, false
    set :DB, Sequel.sqlite('db/database.db')
  end

  before do
    $usersDB = settings.DB[:users]
    $postsDB = settings.DB[:posts]
    $filesDB = settings.DB[:files]
  end

  set :markdown, Redcarpet::Markdown.new(HTMLWithPygments.new, fenced_code_blocks: true, smartypants: true)

  get '/' do
    @title = '>/Home $'
    @js = ["home-script"]
    @css = ["home-styles"]
    erb :home
  end

  get '/about' do
    @title = '>/Whoami $'
    @css = ["about-styles"]
    erb :about
  end

  get '/categories' do
    @title = '>/Categories $'
    @js = ["sanitizehtml-script"]
    @css = ["categories-styles"]
    @posts = $postsDB.where(is_public: 1).all.each { |post| post[:content] = prepare_post(post[:content]) }
    @categories = @posts.flat_map { |post| post[:category].split(',').map(&:capitalize) }
                        .uniq
                        .select { |category| @posts.any? { |post| post[:category].split(',').include?(category) } }
    @categories.sort_by! { |category| category.downcase == 'intro' ? '' : category.downcase }
    erb :categories
  end


  get '/categories/:category' do
    @css = ["categories-styles"]
    category_param = params[:category]
    @posts = $postsDB.where(is_public: 1).all.each { |post| post[:content] = post[:content] }
    @categories = [category_param]
    @posts = @posts.select { |post| post[:category].split(',').map(&:downcase).include?(category_param.downcase) }
    erb :category
  end

  get '/ctfs' do
    @title = '>/Ctfs $'
    @css = ["writeups-styles"]
    if current_user.is_admin?
      @writeups = $postsDB.exclude(ctf_name: nil).exclude(ctf_name: '').all.each { |post| post[:content] = prepare_post(post[:content]) }
    else
      @writeups = $postsDB.where(is_public: 1).exclude(ctf_name: nil).exclude(ctf_name: '').all.each { |post| post[:content] = prepare_post(post[:content]) }
    end
    @ctfs = @writeups.map { |w| w[:ctf_name] }.uniq
    erb :writeups
  end

  get '/post/:id' do
    @js = ["post-script"]
    @css = ["post-styles"]
    params_id = params[:id]

    if params_id.numbers_only?
      @post = $postsDB.where(id: params_id).all.first
    end

    if @post
      encoded_title = ERB::Util.url_encode(@post[:title])
      redirect "/post/#{encoded_title.downcase}"
    end

    @post = $postsDB.where(Sequel.like(:title, params_id, case_insensitive: true)).all.first
    params_id = @post[:id]

    if @post.nil?
      redirect '/error'
    end

    unless @post[:files_path].nil?
      @post = PostFromFiles.new(params_id, $postsDB).return_hash
    end

    @post[:content] = prepare_post(@post[:content])

    if @post[:is_public] == 1
      return erb :post
    end

    if current_user.is_admin?
      return erb :post
    end

    redirect '/error'
  end

  get '/posts' do
    @js = ["sanitizehtml-script"]
    @css = ["posts-styles"]

    page = (params[:page] || 1).to_i
    per_page = 6
    offset = (page - 1) * per_page

    @posts = $postsDB
               .where(:is_public => 1)
               .order(Sequel.desc(:date))
               .limit(per_page)
               .offset(offset)
               .all
               .each { |post| post[:content] = post[:content] }

    @total_posts = $postsDB.where(:is_public => 1).count
    @total_pages = (@total_posts / per_page.to_f).ceil
    @current_page = page

    dates = @posts.map { |post| post[:date] }
    @years = dates.map { |date| date.year }.uniq

    erb :posts
  end

  get '/edit-file/*' do
    unless current_user.is_admin?
      redirect '/error'
    end
    @css = ["new-post-styles"]
    @action_endpoint = "/edit-file"
    file_name = params[:splat].first
    @file_path = File.join(settings.public_folder, file_name)
    if is_text_file?(@file_path)
      @content = File.read(@file_path)
    else
      @content = "File is not a text file."
    end
    erb :edit_file
  end

  post '/edit-file' do
    unless current_user.is_admin?
      redirect '/error'
    end
    content = params[:content]
    file_path = params[:file_path]
    if file_operation_exists_and_permitted?(file_path)
      begin
        File.open(file_path, 'w') do |file|
          file.write(content)
        end
        redirect '/files'
      rescue => e
        puts "Błąd podczas zapisywania pliku: #{e.message}"
        redirect '/error'
      end
    else
      redirect '/error'
    end
  end

  get '/edit-attachment/:id' do
    if current_user.is_admin?
      @js = ["new-post-script"]
      @error = " "
      @post = $postsDB.where(id: params[:id]).all.first
      @action_endpoint = "/edit-attachment"
      @content = @post[:attachment]
      @css = ["new-post-styles"]
      return erb :edit_file
    end

    redirect '/error'
  end

  post '/edit-attachment' do
    $postsDB.where(id: params[:id]).update(attachment: params[:content])
    redirect "/post/#{find_post_title_by_id(params[:id])}"
  end

  get '/showfile/*' do
    unless current_user.is_admin?
      redirect '/error'
    end
    @css = ["post-styles"]
    @file_name = params[:splat].first
    @file_path = File.join(settings.public_folder, @file_name)
    if is_text_file?(@file_path)
      @content = prepare_post(File.read(@file_path))
    else
      @content = "File is not a text file."
    end
    erb :show_file
  end

  get '/edit/:id' do
    if current_user.is_admin?
      @js = ["new-post-script"]
      @categories = []
      @error = " "
      @post = $postsDB.where(id: params[:id]).all.first
      @categories << @post[:category]
      @tags = @post[:tags]
      @css = ["new-post-styles"]
      return erb :new_post
    end

    redirect '/error'
  end

  get '/tags' do
    @css = ["tags-styles"]
    @js = ["tags-script"]
    @posts = $postsDB.where(is_public: 1).all.each { |post| post[:content] = prepare_post(post[:content]) }
    @tags = @posts.flat_map { |post| post[:tags].split(',') }.uniq
    erb :tags
  end

  post '/tags/:tag' do
    tag_param = params[:tag].downcase
    @posts = $postsDB.where(is_public: 1).all.each { |post| post[:content] = prepare_post(post[:content]).remove_some_html_tags.trimm_to_preview }
    @posts.select! do |post|
      tags = post[:tags].split(',').map(&:strip).map(&:downcase)
      tags.include?(tag_param)
    end

    @posts.each do |post|
      post[:title] = post[:title].titleize
    end

    if @posts.empty?
      content_type :json
      { success: false, error: "Nie znaleziono żadnych postów dla tagu '#{tag_param}'" }.to_json
    else
      content_type :json
      { success: true, tag: tag_param, articles: @posts }.to_json
    end
  end

  get '/new-post' do
    if current_user.is_admin?
      @error = " "
      @js = ["new-post-script"]
      @categories = $postsDB.select(:category).distinct.map(:category)
      @css = ["new-post-styles"]
      return erb :new_post
    end

    redirect '/error'
  end

  post '/new-post' do
    $postsDB.insert(title: params[:title],
      date: Time.now,
      tags: params[:tags].strip.squeeze,
      author: current_user[:username],
      category: params[:category],
      content: params[:content],
      is_public: 0)
    redirect '/posts-cms'
  end

  post '/edit-post' do
    post_files = post_has_files?(params[:id])
    unless post_files.nil?
      writeup_file = File.join(settings.public_folder, 'writeups', post_files, 'solve/WRITEUP.md')
      if file_operation_exists_and_permitted?(writeup_file)
        begin
          File.open(writeup_file, 'w') do |file|
            file.write(params[:content])
          end
        rescue => e
          puts "Błąd podczas zapisywania pliku: #{e.message}"
          redirect '/error'
        end
      end
    end
    $postsDB.where(id: params[:id]).update(
      title: params[:title],
      edited_date: Time.now,
      tags: params[:tags].strip.squeeze,
      author: current_user[:username],
      category: params[:category],
      content: params[:content],
      is_public: params[:is_public]
    )
    redirect "/post/#{find_post_title_by_id(params[:id])}"
  end

  get '/posts-cms' do
    if current_user.is_admin?
      @css = ["cms-styles"]
      @js = ["cms-script"]
      return erb :cms, locals: { posts: $postsDB }
    end

    redirect '/error'
  end

  get '/files-cms' do
    if current_user.is_admin?
      @css = ["cms-styles"]
      @js = ["files-cms-script"]
      @directory_tree = generate_tree(File.join(settings.public_folder, 'writeups'))
      return erb :files_cms
    end

    redirect '/error'
  end

  get '/load_folder' do
    path = File.join(URI.decode_www_form_component(params[:path]))
    prefix = params[:prefix]
    generate_tree(path, prefix, false)
  end

  get '/admin' do
    if current_user.is_admin?
      @css = ["admin-styles"]
      return erb :admin
    end

    redirect '/error'
  end

  post '/publish' do
    post_id = params[:post_id]
    button_value = params[:button]

    if current_user.is_admin?
      if post_id.nil? || post_id.empty? || button_value.nil? || button_value.empty?
        halt 400, { success: false, message: "Button value is missing" }.to_json
      end

      $postsDB.where(id: post_id).update(is_public: button_value)
      content_type :json
      { success: true, message: "Post updated successfully" }.to_json
    else
      content_type :json
      status 403
      { success: false, message: "Unauthorized" }.to_json
    end
  end

  post '/check-title' do
    data = JSON.parse(request.body.read)
    title = data['title'].strip.downcase
    if title.nil? || title.empty?
        { error: 'Title cannot be empty' }.to_json
      else
        if $postsDB.select(:title).where(Sequel.like(:title, title, case_insensitive: true)).all.count > 0
          content_type :json
          { success: false, error: "Post with that title already exists." }.to_json
        else
          content_type :json
          { success: true, message: 'Title is valid' }.to_json
        end
      end
  end

  get '/delete/:id' do
    @css = ["cms-styles"]
    @js = ["cms-script"]
    if current_user.is_admin?
      post_to_delete = $postsDB.select(:id).where(:id => params[:id]).first
      unless post_to_delete.nil?
        post_files = $postsDB.select(:files_path).where(:id => params[:id]).first[:post_files]
        unless post_files.nil?
          delete_directory("/" + post_files[:files_path])
        end
        $postsDB.select(:id).where(:id => params[:id]).delete
      else
        @error = "Invalid ID"
      end
      return erb :cms, locals: { posts: $postsDB }
    end

    redirect '/error'
  end

  get '/new-writeup' do
    @error=""
    @css = ["new-writeup-styles"]
    @js = ["new-writeup-script"]
    if current_user.is_admin?
      return erb :new_writeup
    end

    redirect '/error'
  end

  post '/new-writeup/:stage' do
    @css = ["new-post-styles", "new-writeup-styles"]
    @js = ["new-writeup-script"]
    unless current_user.is_admin?
      redirect '/error'
    end
    stage = params[:stage].to_i
    case stage
    when 1
      if params[:ctf_name].nil? || params[:ctf_name].empty? || params[:title].nil? || params[:title].empty?
        @error = "Invalid parameters!"
        params[:stage] = nil
        return erb :new_writeup
      end
      $creator = GitWriteupCreator.new(ctf_name: params[:ctf_name], title: params[:title])
    when 2
      #add task description and task files
      $creator.add_task(params[:content])
      save_files(files: params[:files], base_path: $creator.get_publish_path)
    when 3
      #upload images
      @js = ["new-writeup-images-script", "new-writeup-script"]
      save_files(files: params[:files], base_path: $creator.get_solve_path, sub_directory: 'images')
    when 4
      #add everything to db and save in readme.md
      $creator.add_writeup(params[:content])
      $postsDB.insert(title: $creator.ctf_title,
        date: Time.now,
        tags: params[:tags].strip.squeeze,
        author: current_user[:username],
        category: params[:category],
        content: params[:content],
        is_public: 0,
        ctf_name: $creator.ctf_name,
        files_path: $creator.get_path_for_db)
      redirect '/posts-cms'
    else
      @error = "Invalid stage number!"
    end
    erb :new_writeup, locals: { params: params }
  end

  get '/logout' do
    session.clear
    redirect '/'
  end

  get '/getlogincookie' do
    if current_user
      @css = ["home-styles"]
      erb :home
    else
      session.clear
      session[:allowed] = 1
      redirect '/login'
    end
  end

  get '/files' do
    @css = ["files-styles"]
    @js = ["files-script"]
    unless current_user.is_admin?
      redirect '/errror'
    end
    erb :file_browser
  end

  post '/files/*' do
    content_type :json
    list_files_and_json(params['splat'].first).to_json
  end

  post '/files' do
    content_type :json
    list_files_and_json.to_json
  end

  get '/getfile/*' do
    file_path = params[:splat].first
    get_file(file_path)
  end

  get '/post/getfile/*' do
    file_path = params[:splat].first
    get_file(file_path)
  end

  post '/files-upload' do
    content_type :json

    if params[:file]
      path = params[:path]
      file_name = params[:file][:filename]
      file = params[:file][:tempfile]
      file_path = File.join(settings.public_folder, path, file_name)

      if File.exist?(file_path)
        { success: false, message: 'File already exists', filename: file_name }.to_json
      else
        File.open(file_path, 'wb') do |f|
          f.write(file.read)
        end
        { success: true, message: 'File uploaded successfully', filename: file_name }.to_json
      end
    else
      { success: false, message: 'No file uploaded' }.to_json
    end
  end

  post '/manage-files' do
    content_type :json

    return { error: "403 Forbidden" }.to_json unless current_user.is_admin?

    data = JSON.parse(request.body.read)
    action = data['action']
    file_path = data['path'].gsub('/files', '')
    full_path = File.join(settings.public_folder, file_path)
    file = find_file_in_db(full_path)

    def update_db(path, updates)
      $filesDB.where(path: path).update(updates)
    end

    def json_response(success:, message: nil, error: nil)
      { success: success, message: message, error: error }.compact.to_json
    end

    case action
    when "publish"
      if file
        update_db(full_path, permission: 1)
      else
        $filesDB.insert(name: File.basename(full_path), path: full_path, owner: current_user[:username], permission: 1)
      end
      json_response(success: true, message: "File published")

    when "hide"
      if file
        update_db(full_path, permission: 0)
        json_response(success: true, message: "File hidden")
      else
        json_response(success: false, error: "File untracked")
      end

    when "delete"
      if file_operation_exists_and_permitted?(full_path)
        check_for_file = File.directory?(full_path)
        unless check_for_file
          File.delete(full_path)
          if file
            $filesDB.where(path: full_path).delete
          end
        else
          delete_directory(full_path)
        end
        json_response(success: true, message: "File successfully deleted")
      else
        json_response(success: false, error: "File not found or permission denied")
      end

    when "rename"
      new_path = data['newPath']
      full_new_path = File.join(settings.public_folder, new_path)

      if file_operation_exists_and_permitted?(full_path)
        File.rename(full_path, full_new_path)
        update_db(full_path, path: full_new_path, name: File.basename(full_new_path)) if file
        json_response(success: true, message: "File successfully renamed")
      else
        json_response(success: false, error: "File not found or permission denied")
      end

    when "unzip"
      location = data['currentPath']
      full_location_path = File.join(settings.public_folder, location)

      if file_operation_exists_and_permitted?(full_path)
        file_count = unzip_file(full_path, full_location_path)
        json_response(success: true, message: "#{file_count} file(s) unzipped successfully")
      else
        json_response(success: false, error: "File not found or permission denied")
      end

    else
      json_response(success: false, error: "Invalid action: #{action}")
    end
  end


  post '/rmdir/*' do
    return { error: "403 Forbidden" }.to_json unless current_user.is_admin?

    dir_path = params[:splat].first
    full_dir_path = File.join(settings.public_folder, dir_path)
    delete_directory(full_dir_path)
  end

  post '/mkdir' do
    content_type :json

    return { error: "403 Forbidden" }.to_json unless current_user.is_admin?

    data = JSON.parse(request.body.read)
    data_path = data["path"].gsub('/files','')
    data_name = data["name"]

    new_dir_path = File.join(settings.public_folder, data_path, data_name)
    if Dir.exist?(new_dir_path)
      { error: 'Directory already exists' }.to_json
    else
      Dir.mkdir(new_dir_path)
      { success: true }.to_json
    end
  end

  get '/login' do
    if current_user
      @css = ["home-styles"]
      erb :home
    else
      @css = ["login-styles"]
      erb :login
    end
  end

  post '/login' do
    if params[:username].empty? || params[:password].empty?
      login_failed
    end

    if current_user
      redirect '/'
    end

    user_found = false
    $usersDB.each do |user|
      if params[:username] == user[:username]
        user_found = true
        pass_t = user[:password_hash]
        if test_password(params[:password], pass_t)
          session.clear
          session[:user_id] = user[:id]
          redirect '/'
        else
          login_failed
        end
      end
    end

    login_failed unless user_found
  end

  get '/error' do
    @css = ["error404-styles"]
    erb :error404
  end

  get '/file-error' do
    @css = ["error404-styles"]
    erb :file_error
  end

  get '/backup' do
    if current_user.is_admin?
      backup_file = 'db/backup.db'
      FileUtils.cp('db/database.db', backup_file)
      send_file backup_file, type: 'application/octet-stream', filename: 'backup.db'
    else
      redirect '/error'
    end
  end

#Spellcheck kinda works for now
  post '/spellcheck' do
    request_payload = JSON.parse(request.body.read)
    text = request_payload['content']
    uri = URI.parse("https://api.languagetool.org/v2/check")
    response = Net::HTTP.post_form(uri, {
      'text' => text,
      'language' => 'en'
    })

    result = JSON.parse(response.body)
    errors = result['matches'].map do |match|
      { message: match['message'], offset: match['offset'], length: match['length'] }
    end

    content_type :json
    { errors: errors }.to_json
  end

  def save_files(files:, base_path:, sub_directory: nil)
    return unless files

    files.each do |file|
      filename = file[:filename]
      filepath = sub_directory ? File.join(base_path, sub_directory, filename) : File.join(base_path, filename)
      File.open(filepath, 'wb') do |f|
        f.write(file[:tempfile].read)
      end
    end
  end

  def delete_directory(dir_path)
    #puts dir_path
    if File.exist?(dir_path) && File.directory?(dir_path)
      FileUtils.rm_rf(dir_path)
      { success: true, message: "File successfully deleted" }.to_json
    else
      { success: false, error: "Dir not found or permission denied" }.to_json
    end
  end

  def file_operation_exists_and_permitted?(path)
    File.exist?(path) && has_permission?(path)
  end

  def has_permission?(file_path)
    if current_user.is_admin?
      return true
    else
      return check_is_file_published(file_path)
    end
  end

  def login_failed
   session.clear
   @error = 'Username or password was incorrect.'
   @css = ["login-styles"]
   return erb :login
  end

  def get_file(file_path)
    full_path = File.join(settings.public_folder, file_path)

    if File.exist?(full_path) && has_permission?(full_path)
      send_file full_path, :filename => File.basename(full_path), :type => 'Application/octet-stream'
    else
      redirect '/file-error'
    end
  end

  def list_files_and_json(path = "")
    unless current_user.is_admin?
      halt 403, { error: 'Forbidden' }.to_json
    end

    base_folder = File.join(settings.public_folder, path)
    #puts base_folder
    if Dir.exist?(base_folder)
      entries = Dir.entries(base_folder).select { |entry| entry != '.' && entry != '..' }

      folders = []
      files = []

      entries.each do |entry|
        full_path = File.join(base_folder, entry)
        is_directory = File.directory?(full_path)
        is_published = check_is_file_published(full_path)
        if is_directory
          folders << { name: entry, is_directory: true }
        else
          files << { name: entry, is_directory: false, is_public: is_published }
        end
      end

      { path: CGI.unescape(request.path_info), parent_path: File.dirname(request.path_info), files: (folders.sort_by { |f| f[:name] } + files.sort_by { |f| f[:name] }) }
    else
      { error: "Folder does not exist." }
    end
  end

  def find_file_in_db(full_path)
    $filesDB.where(path: full_path).all.first
  end

  def post_has_files?(id)
    $postsDB.select(:files_path).where(id: id).first[:files_path]
  end

  def check_is_file_published(full_path)
    #Add here Sequel like with case insensitive it it's gonna make more troubles
    perm = $filesDB.select(:permission).where(path: full_path).first[:permission]
    if perm == 1
      return true
    else
      return false
    end
  end

  def find_post_title_by_id(id)
    $postsDB.where(id: id).all.first[:title]
  end

  def prepare_post(markdown_content)
    html_content = settings.markdown.render(markdown_content)
    return html_content
  end

  def is_text_file?(file_path)
    mime_type = MIME::Types.type_for(file_path).first
    mime_type && mime_type.media_type == 'text'
  end

  def unzip_file(zip_file_path, destination_folder)
    extracted_files_count = 0

    Zip::File.open(zip_file_path) do |zip_file|
      zip_file.each do |entry|
        file_path = File.join(destination_folder, entry.name)
        FileUtils.mkdir_p(File.dirname(file_path))
        unless File.exist?(file_path)
          zip_file.extract(entry, file_path)
          extracted_files_count += 1
        end
      end
    end
    extracted_files_count
  end

  def generate_tree(path, prefix = '', is_last = true)
    items = Dir.entries(path) - %w[. ..]
    directories = items.select { |item| File.directory?(File.join(path, item)) }
    files = items.select { |item| !File.directory?(File.join(path, item)) }
    sorted_items = directories.sort + files.sort
    sorted_items.each_with_index.map do |item, index|
      full_path = File.join(path, item)
      is_last_item = index == sorted_items.size - 1
      new_prefix = prefix + (is_last_item ? '    ' : '│   ')

      if File.directory?(full_path)
        # Dla katalogu
        encoded_path = URI.encode_www_form_component(full_path)
        folder_html = "#{prefix}#{is_last_item ? '└───' : '├───'}<span class='folder' data-folder-id='#{encoded_path}' onclick=\"toggleFolder('#{encoded_path}', '#{new_prefix}')\">[+] #{item}</span><br>"
        folder_html += "<div id='#{encoded_path}' class='folder-content' style='display: none;'></div>"
        folder_html
      else
        # Dla pliku
        "#{prefix}#{is_last_item ? '└───' : '├───'}#{item}<br>"
      end
    end.join
  end


  helpers do
   def current_user
     if session[:user_id]
       $usersDB.where(:id => session[:user_id]).all[0]
     else
       nil
     end
   end
 end

 not_found do
   status 404
   redirect '/error'
 end

  run!
end
