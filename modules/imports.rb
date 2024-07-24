require 'sinatra'
require 'redcarpet'
require 'rouge'
require 'rouge/plugins/redcarpet'
require 'json'
require 'net/http'
require 'uri'
require 'sequel'
require 'bcrypt'

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
end
