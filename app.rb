require 'sinatra'
require 'redcarpet'
require 'rouge'
require 'rouge/plugins/redcarpet'
require 'json'
require 'net/http'
require 'uri'
require 'sequel'
require 'bcrypt'

DB = Sequel.sqlite 'db/database.db'
$usersDB = DB[:users]
$postsDB = DB[:posts]

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
    @css = ["categories-styles"]
    @posts = DB[:posts].where(is_public: 1).all.each { |post| post[:content] = prepare_post(post) }
    @categories = @posts.flat_map { |post| post[:category].split(',') }.uniq
    @categories.sort_by! { |category| category.downcase == 'intro' ? '' : category.downcase }
    erb :categories
  end

  get '/categories/:category' do
    @css = ["categories-styles"]
    category_param = params[:category]
    @posts = DB[:posts].where(is_public: 1).all.each { |post| post[:content] = prepare_post(post) }
    @categories = [category_param]
    @posts = @posts.select { |post| post[:category].split(',').map(&:downcase).include?(category_param.downcase) }
    erb :category
  end

  get '/post/:id' do
    @css = ["post-styles"]
    @post = $postsDB.where(id: params[:id]).all.first
    @post[:content] = prepare_post(@post)

    if @post[:is_public] == 1
      return erb :post
    end

    if current_user
      if current_user[:isAdmin] == 1
        return erb :post
      end
    end

    redirect '/error'
  end

  get '/posts' do
    @css = ["posts-styles"]
    @posts = DB[:posts].where(:is_public => 1).order(Sequel.desc(:date)).all.each { |post| post[:content] = prepare_post(post) }
    dates = @posts.map { |post| post[:date] }
    @years = dates.map { |date| date.year }.uniq
    erb :posts
  end

  get '/tags' do
    @css = ["tags-styles"]
    @js = ["tags-js"]
    @posts = DB[:posts].where(is_public: 1).all.each { |post| post[:content] = prepare_post(post) }
    @tags = @posts.flat_map { |post| post[:tags].split(',') }.uniq
    erb :tags
  end

  post '/tags/:tag' do
    tag_param = params[:tag].downcase
    @posts = DB[:posts].where(is_public: 1).all.each { |post| post[:content] = prepare_post(post) }
    @posts.select! do |post|
      tags = post[:tags].split(',').map(&:strip).map(&:downcase)
      tags.include?(tag_param)
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
    if current_user
      @css = ["new_post-styles"]
      erb :new_post
    else
      redirect '/login'
    end
  end

  post '/new-post' do
    $postsDB.insert(title: params[:title],
      date: Time.now,
      tags: "Mocked tags",
      author: current_user[:username],
      category: "Mocked category",
      content: params[:content],
      is_public: 0)
    redirect '/posts-cms'
  end

  get '/posts-cms' do
    if current_user
      if current_user[:isAdmin] == 1
        @css = ["cms-styles"]
        @js = ["cms-js"]
        erb :cms, locals: { posts: $postsDB }
      end
    else
      redirect '/login'
    end
  end

  post '/publish' do
    post_id = params[:post_id]
    button_value = params[:button]
    if current_user
      if current_user[:isAdmin] == 1
        if post_id.nil? || post_id.empty? || button_value.nil? || button_value.empty?
          halt 400, { success: false, message: "Button value is missing" }.to_json
        end

        $postsDB.where(id: post_id).update(is_public: button_value)
        content_type :json
        { success: true, message: "Post updated successfully" }.to_json
      end
    else
      content_type :json
      status 403
      { success: false, message: "Unauthorized" }.to_json
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

  post '/preview' do
    markdown_content = params[:content]
    html_content = settings.markdown.render(markdown_content)
    erb :preview, locals: { content: html_content }
  end

#Spellcheck kinda works for now
  post '/spellcheck' do
    request.body.rewind
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

  def login_failed
   session.clear
   @error = 'Username or password was incorrect.'
   @css = ["login-styles"]
   erb :login
  end

  def prepare_post(post)
    markdown_content = post[:content]
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
