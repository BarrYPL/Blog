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
      is_public: @is_public,
      ctf_name: @ctf_name,
      publish_content: @publish_content
    }
  end

  private

  def fetch_post_details
    result = @database.select(:title, :files_path, :date, :tags, :author, :category, :is_public, :ctf_name).where(id: @id).first
    if result
      @title = result[:title]
      @path = result[:files_path]
      @date = result[:date]
      @tags = result[:tags]
      @author = result[:author]
      @category = result[:category]
      @is_public = result[:is_public]
      @content = update_images(File.open("public/writeups/#{@path}/solve/WRITEUP.md").read, "/writeups/#{@path}/solve/")
      @ctf_name = result[:ctf_name]
      @publish_content = update_links(File.open("public/writeups/#{@path}/README.md").read)
    else
      @title = nil
      @path = nil
      @date = nil
      @tags = nil
      @author = nil
      @category = nil
      @is_public = nil
      @content = nil
      @ctf_name = nil
      @publish_content = nil
    end
  end

  def update_links(text)
    old_link = text.match(/(?<=\/)[^)]*\/[^)]*(?=\))/) #Match [./file/name] as file/name
    updated_link =  "getfile/#{@path.gsub('\\','/')}/#{old_link}"#.gsub(" ",'%20') #Makes link to getfile endpoint
    text.gsub(/(?<=\()[^)]*(?=\))/, updated_link)
  end

  def update_images(text, path)
    updated_text = text.gsub('./', path)
    updated_text
  end
end
