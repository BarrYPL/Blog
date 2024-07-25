class PostFromFiles
  attr_reader :id, :title, :content, :path

  def initialize(id, database)
    @id = id
    @database = database
    fetch_post_details
  end

  def return_hash
    {
      title: @title,
      id: @id,
      content: @content,
      date: @date,
      tags: @tags,
      author: @author,
      category: @category,
      is_public: @is_public
    }
  end

  private

  def fetch_post_details
    result = @database.select(:title, :files_path, :date, :tags, :author, :category, :is_public).where(id: @id).first
    if result
      @title = result[:title]
      @path = result[:files_path]
      @date = result[:date]
      @tags = result[:tags]
      @author = result[:author]
      @category = result[:category]
      @is_public = result[:is_public]
      @content = File.open("public/writeups/#{@path}/Solve/WRITEUP.md").read
    else
      @title = nil
      @path = nil
      @date = nil
      @tags = nil
      @content = nil
      @is_public = nil
      @category = nil
      @author = nil
    end
  end
end
