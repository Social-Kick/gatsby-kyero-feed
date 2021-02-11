/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
// You can delete this file if you're not using it

/**
 * You can uncomment the following line to verify that
 * your plugin is being loaded in your site.
 *
 * See: https://www.gatsbyjs.com/docs/creating-a-local-plugin/#developing-a-local-plugin-that-is-outside-your-project
 */
exports.onPreInit = () => console.log("Loaded gatsby-kyero-feed")

const fs = require("fs").promises;
const mkdirp= require("mkdirp")
const path = require("path");
const RSS = require ("./rss");
const merge = require("lodash.merge")

const { defaultOptions, runQuery } = require("./internals")
const pluginOptionsSchema = require("./plugin-options")

const publicPath = `./public`

const fileExists = async path => !!(await fs.promises.stat(path).catch(e => false));


exports.pluginOptionsSchema = pluginOptionsSchema

// TODO: remove in the next major release
// A default function to transform query data into feed entries.
const serialize = ({ query: { site, allContentfulSilcEstate } }) =>
allContentfulSilcEstate.edges.map(edge => {
    return {
      ...edge.node.id,
    }
  })

exports.onPostBuild = async ({ graphql }, pluginOptions) => {
  /*
   * Run the site settings query to gather context, then
   * then run the corresponding feed for each query.
   */
  const options = {
    ...defaultOptions,
    ...pluginOptions,
  }

  const baseQuery = await runQuery(graphql, options.query)

  for (let { ...feed } of options.feeds) {
    if (feed.query) {
      feed.query = await runQuery(graphql, feed.query).then(result =>
        merge({}, baseQuery, result)
      )
    }

    const { setup, ...locals } = {
      ...options,
      ...feed,
    }

    const serializer =
      feed.serialize && typeof feed.serialize === `function`
        ? feed.serialize
        : serialize

    const rssFeed = (await serializer(locals)).reduce((merged, item) => {
      merged.property(item)
      return merged
    }, new RSS(setup(locals)))

    const outputPath = path.join(publicPath, feed.output)
    const outputDir = path.dirname(outputPath)
    if (!(await fs.access(outputDir))) {
      await mkdirp(outputDir)
    }
    await fs.writeFile(outputPath, rssFeed.xml())
  }
}