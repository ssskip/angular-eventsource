/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 skip
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (window, angular) {
  'use strict';

  var isArray = angular.isArray;
  var isObject = angular.isObject;
  var extend = angular.extend;
  var isString = angular.isString;
  var isObject = angular.isObject;
  var fromJson = angular.fromJson;
  var $eventSourceMinErr = angular.$$minErr('$eventSource');

  $eventSourceProvider.$inject = ["$rootScope", '$q', '$timeout', '$$eventSourceBackend', '$log'];
  function $eventSourceProvider($rootScope, $q, $timeout, $$eventSourceBackend, $log) {
    /**
     *
     * @param url
     * @param options
     *
     */
    function $eventSource(url, options) {
      options = options || {};
      this.url = url;
      this.onErrorListeners = [];
      this.onMessageListeners = [];
      this.onOpenListeners = [];
      this.$$new();
    }


    $eventSource.prototype = {
      /**
       * [EventSource] (https://developer.mozilla.org/en-US/docs/Web/API/EventSource#Constants)
       * @type {{CONNECTING: number, OPEN: number, CLOSED: number}}
       * @private
       */
      _readyStateConstants: {
        CONNECTING: 0,
        OPEN: 1,
        CLOSED: 2
      },

      $$new: function () {
        if (!this.eventSource || this.eventSource.readyState !== this._readyStateConstants.OPEN) {
          this.eventSource = $$eventSourceBackend.newEventSource(this.url);
          $log.info('New EventSource created! Publish url:' + this.url);
          this.eventSource.onopen = this._onOpen.bind(this);
          this.eventSource.onerror = this._onError.bind(this);
          this.eventSource.onmessage = this._onMessage.bind(this);
        }
      },
      _onError: function (event) {
        $log.warn('EventSource object trigger error event!', event);
        for (var i = 0; i < this.onErrorListeners; i++) {
          this.onErrorListeners[i].call(this, event);
        }
      },
      _onOpen: function () {
        for (var i = 0; i < this.onErrorListeners; i++) {
          this.onOpenListeners[i].call(this);
        }
      },
      _onMessage: function (msg) {
        var message = new Message(msg);
        for (var i = 0; i < this.onErrorListeners; i++) {
          this.onMessageListeners[i].call(this, message);
        }
      },
      onError: function (listener) {
        this.onErrorListeners.push(listener);
        return this;
      },
      onOpen: function (listener) {
        this.onOpenListeners.push(listener);
        return this;
      },
      /**
       * register listener on message come in
       * @param listener
       * @returns {$eventSource}
       */
      onMessage: function (listener) {
        this.onMessageListeners.push(listener);
        return this;
      }
    }

  }

  /**
   * [EventSource W3C Specification](http://www.w3.org/TR/eventsource/)
   */
  function $$eventSourceBackend() {
    /**
     * The EventSource() constructor takes one or two arguments. The first specifies the URL to which to connect.
     * The second specifies the settings, if any, in the form of an EventSourceInit dictionary.
     *
     *  @param url
     * @param options
     * @returns {Raw EventSource object}
     */
    this.newEventSource = function (url, options) {
      if (this.isEventSource) {
        return this.EventSource(url, options);
      }
    }
  }

  $$eventSourceBackend.prototype = {
    EventSource: window.EventSource,
    /**
     * detect current backend is EventSource or not
     * @type {boolean|*}
     */
    isEventSource: isObject(window.EventSource)
  }
  /**
   * Incoming message wrapper
   * @param msg   raw message
   * @constructor
   */
  function Message(msg) {
    if (isString(msg)) {
      msg = fromJson(msg);
    }
    var message = {
      event: '',
      data: '',
      id: ''
    }
    return extend(message, msg);
  }

  //function $$LongPollBackEnd() {
  //
  //}

  angular.module('ngEventSource', [])
    .factory('$eventSource', $eventSourceProvider)
    .service('$$eventSourceBackend', $$eventSourceBackend);

})(window, window.angular);
