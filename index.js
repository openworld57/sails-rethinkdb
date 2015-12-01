"use strict";
var Connection = require("./lib/connection")
global.pd = console.log.bind(console)

module.exports = (function() {
  var adapter = {
    syncable: true,

    defaults: {},

    connections: {},

    /**
     * Register A Connection
     *
     * Will open up a new connection using the configuration provided and store the DB
     * object to run commands off of. This creates a new pool for each connection config.
     */
    registerConnection(options, tables, cb) {
      if(!options.identity) return cb(new Error('Connection is missing an identity.'))
      if(this.connections[options.identity]) return cb(new Error('Connection is already registered.'))

      Connection.connect(options, tables, (err, connection) => {
        if (err) return cb(err)
        this.connections[options.identity] = connection
        cb()
      })
    },

    /**
     * Fired when a model is unregistered, typically when the server
     * is killed. Useful for tearing-down remaining open connections,
     * etc.
     */
    // Teardown a Connection
    teardown(conn, cb) {
      if (typeof conn === 'function') {
        cb = conn
        conn = null
      }
      if (!conn) {
        this.connections = {}
        return cb()
      }
      if(!this.connections[conn]) return cb()
      this.connections[conn].close(() => {
        delete this.connections[conn]
      })
      cb()
    },

    /**
     * Native
     *
     * Give access to a native mongo table object for running custom
     * queries.
     */
    native(connectionName, tableName, cb) {
      cb(null, this.connections[connectionName].tables[tableName])
    },

    /**
     * Create
     *
     * Insert a single document into a collection.
     */
    create(connectionName, tableName, data, cb) {
      pd("create", data)
      this.connections[connectionName].tables[tableName].insert(data, cb)
    },

    /**
     * Create Each
     *
     * Insert an array of documents into a collection.
     */
    createEach: function(connectionName, tableName, data, cb) {
      pd("createEach", data)
      this.connections[connectionName].tables[tableName].insertEach(data, cb)
    },

    /**
     * Find
     *
     * Find all matching documents in a colletion.
     */
    find(connectionName, tableName, query, cb) {
      pd("find", query)
      this.connections[connectionName].tables[tableName].find(query, cb)
    },

    /**
     * Update
     *
     * Update all documents matching a criteria object in a collection.
     */
    update(connectionName, tableName, query, data, cb) {
      pd("update", query, data)
      this.connections[connectionName].tables[tableName].update(query, data, cb)
    },

    /**
     * Destroy
     *
     * Destroy all documents matching a criteria object in a collection.
     */
    destroy(connectionName, tableName, query, cb) {
      pd("destroy", query)
      this.connections[connectionName].tables[tableName].destroy(query, cb)
    },

    /**
     * Count
     *
     * Return a count of the number of records matching a criteria.
     */
    count(connectionName, tableName, query, cb) {
      pd("count", query)
      this.connections[connectionName].tables[tableName].count(query, cb)
    }

    /** TODO
     * Join
     *
     * Peforms a join between 2-3 mongo collections when Waterline core
     * needs to satisfy a `.populate()`.
     */
    //join(connectionName, tableName, criteria, cb) {

    /** TODO
     * Stream
     *
     * Stream one or more documents from the collection
     * using where, limit, skip, and order
     * In where: handle `or`, `and`, and `like` queries
     */
    //stream(connectionName, tableName, query, stream) {

  }

  return adapter
})()