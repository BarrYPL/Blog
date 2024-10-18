require 'sequel'
require 'bcrypt'

DB = Sequel.sqlite("database.db")

DB.create_table :users do
  primary_key :id
  String :username
  String :password_hash
  Integer :isAdmin
  Integer :is2FA
  String :twofaKey
end

DB.create_table? :posts do
  primary_key :id
  String :title
  Date :date
  String :tags
  String :author
  String :category
end

def hash_password(password)
  BCrypt::Password.create(password).to_s
end

User = Struct.new(:username, :password_hash, :isAdmin, :is2FA, :twofaKey)
USERS = [
  User.new('test', hash_password('test'), 1, 0, '')
]

users = DB[:users]  # Pobieramy tabelę 'users' z bazy danych

USERS.each do |user|
  users.insert(
    username: user.username,
    password_hash: user.password_hash,
    isAdmin: user.isAdmin,
    is2FA: user.is2FA,
    twofaKey: user.twofaKey
  )
end
