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

  set :markdown, Redcarpet::Markdown.new(HTMLWithPygments.new, fenced_code_blocks: true)

  get '/' do
    @css = ["home-styles"]
    erb :home
  end

  get '/about' do
    erb :about
  end

  get '/categories' do
    erb :categories
  end

  get '/posts' do
    erb :posts
  end

  get '/tags' do
    erb :tags
  end

  get '/lorem-ipsum' do
    erb :lorem_ipsum
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
    $postsDB.insert(title: "Mocked title",
      date: Time.now,
      tags: "Mocked tags",
      author: current_user[:username],
      category: "Mocked category",
      is_public: 0)
    redirect '/posts-cms'
  end

  get '/posts-cms' do
    @css = ["posts_cms-styles"]
    erb :posts_cms, locals: { posts: $postsDB }
  end

  get '/logout' do
    session.clear
    redirect '/'
  end

  get '/login' do
    @css = ["login-styles"]
    erb :login
  end

  def login_failed
   session.clear
   @error = 'Username or password was incorrect.'
   @css = ["login-styles"]
   erb :login
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
