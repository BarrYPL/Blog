class Post
  attr_reader :id, :title, :solve_content, :path
  attr_accessor :content

  def initialize(id, database)
    @id = id
    @database = database
    fetch_post_details
  end

  private

  def fetch_post_details
    result = @database.select(:title, :files_path).where(id: @id).first
    if result
      @title = result[:title]
      @path = result[:files_path]
      @solve_content = File.open("public\\writeups\\" + self.path + "Solve\\WRITEUP.md").read
      @content = @solve_content
    else
      @title = nil
      @path = nil
      @content = nil
    end
  end
end
