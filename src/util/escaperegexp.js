define(function () {
  'use strict'

  function escapeRegExp (s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  }

  return escapeRegExp
})
