#!/usr/bin/env ruby
require 'net/http'
require 'json'
path = ARGV[0]
url = "http://localhost:5000/#{path}"
uri = URI(url)
response = Net::HTTP.get(uri)
puts JSON.parse(response)