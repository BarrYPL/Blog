require_relative('modules/imports')

DB = Sequel.sqlite 'db/database.db'
$usersDB = DB[:users]
$postsDB = DB[:posts]
$filesDB = DB[:files]

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
    set :run            , 'true'
    set :public_folder  , 'public'
    set :views          , 'views'
    set :port           , '80'
    set :bind           , '0.0.0.0'
    set :show_exceptions, 'true' #Those are errors
  end

  set :markdown, Redcarpet::Markdown.new(HTMLWithPygments.new, fenced_code_blocks: true, :smartypants => true)

  get '/' do
    @css = ["home-styles"]
    erb :home
  end

  get '/about' do
    erb :about
  end

  get '/categories' do
    @js = ["sanitizehtml-js"]
    @css = ["categories-styles"]
    @posts = $postsDB.where(is_public: 1).all.each { |post| post[:content] = prepare_post(post[:content]) }
    @categories = @posts.flat_map { |post| post[:category].split(',') }.uniq
    @categories.sort_by! { |category| category.downcase == 'intro' ? '' : category.downcase }
    erb :categories
  end

  get '/categories/:category' do
    @css = ["categories-styles"]
    category_param = params[:category]
    @posts = $postsDB.where(is_public: 1).all.each { |post| post[:content] = prepare_post(post[:content]) }
    @categories = [category_param]
    @posts = @posts.select { |post| post[:category].split(',').map(&:downcase).include?(category_param.downcase) }
    erb :category
  end

  get '/post/:id' do
    @js = ["post-js"]
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
    @js = ["sanitizehtml-js"]
    @css = ["posts-styles"]
    @posts = DB[:posts].where(:is_public => 1).order(Sequel.desc(:date)).all.each { |post| post[:content] = prepare_post(post[:content]) }
    dates = @posts.map { |post| post[:date] }
    @years = dates.map { |date| date.year }.uniq
    erb :posts
  end

  get '/edit/:id' do
    if current_user.is_admin?
      @js = ["new-post-js"]
      @categories = []
      @error = " "
      @post = $postsDB.where(id: params[:id]).all.first
      @categories << @post[:category]
      @tags = @post[:tags]
      @css = ["new_post-styles"]
      return erb :new_post
    end

    redirect '/error'
  end

  get '/tags' do
    @css = ["tags-styles"]
    @js = ["tags-js"]
    @posts = $postsDB.where(is_public: 1).all.each { |post| post[:content] = prepare_post(post[:content]) }
    @tags = @posts.flat_map { |post| post[:tags].split(',') }.uniq
    erb :tags
  end

  post '/tags/:tag' do
    tag_param = params[:tag].downcase
    @posts = $postsDB.where(is_public: 1).all.each { |post| post[:content] = prepare_post(post[:content]) }
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
      @js = ["new-post-js"]
      @categories = $postsDB.select(:category).distinct.map(:category)
      @css = ["new_post-styles"]
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
    $postsDB.where(id: params[:id]).update(title: params[:title],
      edited_date: Time.now,
      tags: params[:tags].strip.squeeze,
      author: current_user[:username],
      category: params[:category],
      content: params[:content],
      is_public: params[:is_public])
    redirect "/post/#{find_post_title_by_id(params[:id])}"
  end

  get '/posts-cms' do
    if current_user.is_admin?
      @css = ["cms-styles"]
      @js = ["cms-js"]
      return erb :cms, locals: { posts: $postsDB }
    end

    redirect '/error'
  end

  get '/files-cms' do
    if current_user.is_admin?
      @css = ["cms-styles"]
      return erb :files_cms
    end

    redirect '/error'
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
    @js = ["cms-js"]
    if current_user.is_admin?
      unless $postsDB.select(:id).where(:id => params[:id]).first.nil?
        $postsDB.select(:id).where(:id => params[:id]).delete
      else
        @error = "Invalid ID"
      end
      return erb :cms, locals: { posts: $postsDB }
    else
      redirect '/error'
    end
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
    @js = ["files-js"]
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
    full_path = File.join(settings.public_folder, 'writeups', file_path)

    if File.exist?(full_path) && has_permission?(full_path)
      send_file full_path, :filename => File.basename(full_path), :type => 'Application/octet-stream'
    else
      redirect '/file-error'
    end
  end

  get '/post/getfile/*' do
    file_path = params[:splat].first
    redirect to("/getfile/#{file_path}")
  end

  post '/manage-files' do
    content_type :json

    unless current_user.is_admin?
      return { error: "403 Forbidden" }.to_json
    end

    data = JSON.parse(request.body.read)
    action = data['action']
    full_path = File.join(settings.public_folder, 'writeups', data['path'])
    file = find_file_in_db(full_path) # Hash or nil

    case action
    when "publish"
      if file
        # Update permission in DB
        $filesDB.where(path: full_path).update(permission: 1)
      else
        # Add permitted file to DB
        file_name = File.basename(full_path)
        $filesDB.insert(name: file_name, path: full_path, owner: current_user[:username], permission: 1)
      end
      { success: true, message: "File published" }.to_json

    when "hide"
      if file
        $filesDB.where(path: full_path).update(permission: 0)
        { success: true, message: "File hidden" }.to_json
      else
        # Error, you can't hide file that wasn't published in DB.
        { error: "File untracked" }.to_json
      end

    when "delete"
      if File.exist?(full_path) && has_permission?(full_path)
        File.delete(full_path)
        unless find_file_in_db(full_path).nil?
          $filesDB.where(path: full_path).delete
        end
        { success: true, message: "File successfully deleted" }.to_json
      else
        { error: "File not found or permission denied" }.to_json
      end

    when "rename"
      dir_path = data["path"]
      new_path = data["newPath"]

      full_file_path = File.join(settings.public_folder, 'writeups', dir_path)
      new_file_path = File.join(settings.public_folder, 'writeups', new_path)

      if File.exist?(full_path) && has_permission?(full_path)
        File.rename(full_file_path, new_file_path)
        unless find_file_in_db(full_file_path).nil?
          $filesDB.where(path: full_file_path).update(path: new_file_path, name: File.basename(new_file_path))
        end
        { success: true, message: "File successfully deleted" }.to_json
      else
        { error: "File not found or permission denied" }.to_json
      end

    else
      { error: "Invalid action: #{action}" }.to_json
    end
  end

  post '/rmdir/*' do
    unless current_user.is_admin?
      return { error: "403 Forbidden" }.to_json
    end

    dir_path = params[:splat].first
    full_dir_path = File.join(settings.public_folder, 'writeups', dir_path)
    if File.exist?(full_dir_path) && File.directory?(full_dir_path)
      FileUtils.rm_rf(full_dir_path)
      { success: true, message: "File successfully deleted" }.to_json
    else
      { success: false, error: "Dir not found or permission denied" }.to_json
    end
  end

  post '/mkdir' do
    content_type :json

    unless current_user.is_admin?
      return { error: "403 Forbidden" }.to_json
    end

    data = JSON.parse(request.body.read)
    data_path = data["path"].gsub('/files','')
    data_name = data["name"]
    new_dir_path = File.join(settings.public_folder, 'writeups', data_path, data_name)
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
   erb :login
  end

  def list_files_and_json(path = "")
    unless current_user.is_admin?
      halt 403, { error: 'Forbidden' }.to_json
    end

    base_folder = File.join(settings.public_folder, 'writeups', path)

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
