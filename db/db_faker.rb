require 'sequel'
require 'faker'
require 'date'

# Połącz z bazą danych (utwórz ją, jeśli jeszcze nie istnieje)
db = Sequel.sqlite("test_database.db")

# Funkcja do generowania losowych danych
def generate_post
  title = "#{Faker::Book.title} - #{Faker::Creature::Animal.name} #{Faker::Alphanumeric.alpha(number: 6)}"
  date = DateTime.now
  tags = Faker::Lorem.words(number: 4).join(', ')
  author = Faker::Book.author
  category = Faker::Book.genre
  published = [1, 0].sample
  content = Faker::Lorem.paragraphs(number: 5).join("\n\n")

  {
    title: title,
    date: date,
    tags: tags,
    author: author,
    category: category,
    is_public: published,
    content: content
  }
end

# Liczba postów do wygenerowania
num_posts = 20

# Wstaw dane do tabeli 'posts'
num_posts.times do
  post = generate_post
  db[:posts].insert(post)
end

puts "Dane zostały pomyślnie wstawione do tabeli 'posts'."
gets
