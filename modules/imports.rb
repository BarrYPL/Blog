require 'sinatra'
require 'redcarpet'
require 'rouge'
require 'rouge/plugins/redcarpet'
require 'json'
require 'net/http'
require 'uri'
require 'sequel'
require 'bcrypt'
require 'erb'
require 'cgi'
require 'fileutils'
require 'zip'
require 'mime/types'
require 'readingtime'
require 'sinatra/reloader' if development?
require_relative './PostFromFiles.rb'
require_relative './GitWriteupCreator.rb'

class NilClass
  def is_admin?
    return false
  end
  def method_missing(m, *args, &block)
    return nil
  end
end

class Hash
  def is_admin?
    if self[:isAdmin] == 1
      return true
    else
      return false
    end
  end
end

class String
  def titleize
    self.split.map(&:capitalize).join(' ')
  end

  def numbers_only?
    self.match?(/\A\d+\z/)
  end

  def trimm_to_preview
    self[0..350]
  end

  def remove_some_html_tags
    self.gsub(/<\/?(code|pre|img)[^>]*>/, '')
  end

  def remove_alL_html_tags
    self.gsub(/<[^>]+>/, '')
  end
end
