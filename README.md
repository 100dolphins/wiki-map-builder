# Build Digital Walks with MediaWiki
This tool takes information set up in a [MediaWiki installation](https://www.mediawiki.org/wiki/MediaWiki) and builds a static website with an interactive map built with [Leaflet](https://leafletjs.com/) for users to visit and read about specific stations on a walk. 

The website is built using the static site generator [Hugo](https://gohugo.io/) and [SemanticUI](https://semantic-ui.com/).

##  Prerequisites
To run and use this build you need: 

* a web server capable of running Node.js
* Access to a MediaWiki wiki with the extensions GeoJSON and TextExtracts
* A bot user on that wiki
* A Mapbox account (used for the Map data and an optimization API for the traveling salesman problem). Note that Mapbox is a paid service so you will need to add payment info, smaller projects with less traffic can however be fine with the free plan available

## Installation
### Building your walk on mediawiki
You should start by creating a unique category for your walk (and preferably inform other users on your wiki not to add pages to it). Every page in that category will be rendered as a stop on your walk and should therefore contain the appropriate coordinates. 

Everything before the first section heading in a page will be rendered as the main content for that stop. Most of the wiki markup should be preserved, inline images will however be removed (see also [TextExtracts for other known caveats](https://www.mediawiki.org/wiki/Extension:TextExtracts#Caveats)). Use the additional content pages for images instead.

All content after the first section heading will not be rendered anywhere. Instead this is the place to put links to your additional content pages. **These pages should not be in the category you created for your walk.** All pages linked to from a main page will appear as buttons that will display the respective content as a popup. Each page can contain an image, if you want to show multiple images on a single stop you need one additional content page containing each image. 

The desktop content view also will look for an image in the first additional content page provided, if it does not find one, it will default to your cover image. 

### If you want it to work right away without changing anything past the initial setup:
Download the repo to your local machine  (or directly to your server, if you prefer to edit files that way). The first file you should take a look at is config.toml, which contains the main part of the setup you need to fill in. The file and its comments should be pretty self-explanatory, it is written in [TOML](https://github.com/toml-lang/toml) and contains the info to make your site work, most importantly the login info to Mapbox and your wiki.

After you are done with this set-up, you could already test your page by running bash build in this directory. If everything works, this will build your website in its own directory named /public/. (You can change this and other behaviour by using [additional flags on the hugo command](https://gohugo.io/commands/hugo/))

Your wiki login data will not be visible on the site, as it is handled server-side. Your mapbox token on the other hand will be. If someone wants to find these tokens in a client side app, they will. [Manage the scope and URL restrictions of your tokens instead.](https://docs.mapbox.com/help/troubleshooting/how-to-use-mapbox-securely/)

Hugo will have rendered a few blank pages in your website, we can change that by filling in the files in the /content/ directory. There is an \_index.md-file for each page, most of which contain only one option: the title of that page. Everything after the three crosses can be filled with any [markdown content you want.](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) The endcontent (displayed at the end of a walk) variable in /mobile/\_index.md also accepts markdown. 

### If you want to change styles and tinker with the page:
I would recommend [setting up Git Hooks to deploy your hugo site.](https://www.digitalocean.com/community/tutorials/how-to-deploy-a-hugo-site-to-production-with-git-hooks-on-ubuntu-14-04) You can add the neccessary commands from build to your post-receive-hook to build everything from scratch after pushing content to your server. 