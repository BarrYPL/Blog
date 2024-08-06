class GitWriteupCreator
  attr_reader :ctf_name, :ctf_title

  def initialize(ctf_name:, title:)
    @ctf_name = ctf_name
    @ctf_title = title
    prepare_directories
  end

  def get_publish_path
    return @full_ctf_publish_path.to_s
  end

  def get_solve_path
    return @full_ctf_solve_path.to_s
  end

  def get_path_for_db
    return "#{@ctf_name}/#{@ctf_title}"
  end

  def add_task(text)
    description_file = File.join(@full_ctf_task_path, 'README.md')
    File.write(description_file, text, mode: "a")
  end

  def add_writeup(text)
    writeup_file = File.join(@full_ctf_solve_path, 'WRITEUP.md')
    File.write(writeup_file, text, mode: "a")
  end

  def list_images
    Dir.entries(@full_ctf_images_path).reject { |file| file == '.' || file == '..' }
  end

private

  def prepare_directories
    @full_ctf_dir_path = File.join('public', 'writeups', @ctf_name)
    @full_ctf_task_path = File.join(@full_ctf_dir_path, @ctf_title)
    @full_ctf_solve_path = File.join(@full_ctf_task_path, 'solve')
    @full_ctf_publish_path = File.join(@full_ctf_task_path, 'publish')
    @full_ctf_images_path = File.join(@full_ctf_solve_path, 'images')

    Dir.mkdir(@full_ctf_dir_path) unless Dir.exist?(@full_ctf_dir_path)
    Dir.mkdir(@full_ctf_task_path) unless Dir.exist?(@full_ctf_task_path)
    Dir.mkdir(@full_ctf_solve_path) unless Dir.exist?(@full_ctf_solve_path)
    Dir.mkdir(@full_ctf_publish_path) unless Dir.exist?(@full_ctf_publish_path)
    Dir.mkdir(@full_ctf_images_path) unless Dir.exist?(@full_ctf_images_path)
  end
end
