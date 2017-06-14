/**
 * @fileOverview
 * Progress plugin for shower.
 */
shower.modules.define('shower-video', [
    'util.extend'
], function (provide, extend) {

    /**
     * @class
     * Progress plugin for shower.
     * @name plugin.Video
     * @param {Shower} shower
     * @param {Object} [options] Plugin options.
     * @param {String} [options.selector = '.progress']
     * @constructor
     */
    function Video (shower, options) {
        options = options || {};
        this._shower = shower;
        this._playerListeners = null;

        this.showerCssInit = 0;

        this._element = this._shower.container.getElement();

        this._setupListeners();

        if(this._shower.player.getCurrentSlide()) {
            this.playEverything(this._shower.player.getCurrentSlide().layout.getElement());
        }
    }

    extend(Video.prototype, /** @lends plugin.Progress.prototype */{

        destroy: function () {
            this._clearListeners();
            this._shower = null;
        },

        playEverything: function(element) {
            this._playVideos(element);
            this._playGifs(element);
        },

        _playGifs: function(element) {
            var gifs = element.querySelectorAll('img[src$=".gif"]');
            gifs.forEach(function(el) {
                el.src = el.src;
            });
        },

        _playVideos: function(element) {
            var videos = element.querySelectorAll('video');
            videos.forEach(function(el){
                var play = function() {
                    //Resetting video
                    el.currentTime = 0;
                    el.play();
                };

                var prepareForPlaying = function(){
                    //For triggering video load on iPad
                    el.load();
                    el.play();

                    //And then pause till video fully downloaded
                    el.pause();

                    //TODO: add loader

                    //Waiting till video fully loads
                    el.addEventListener('canplaythrough', play, false);
                };

                if(el && el.currentTime !== undefined) {
                    if (el.readyState !== 4) { //HAVE_ENOUGH_DATA

                        if(this.showerCssInit === 0) {
                            //TODO: add loader
                            //TODO: on first page visit with video, add play button

                            //initing video after first Shower CSS init, to avoid CPU load bottleneck
                            setTimeout(function(){
                                //TODO: move this init to Full mode check
                                this.showerCssInit = 1;

                                el.parentNode.style.display = 'block';

                                prepareForPlaying();
                            }, 700);

                        } else {

                            prepareForPlaying();
                        }

                    } else {
                        play();
                    }
                }
            });
        },

        _setupListeners: function () {
            var shower = this._shower;

            this._showerListeners = shower.events.group()
                .on('destroy', this.destroy, this)

            this._playerListeners = shower.player.events.group()
                .on('activate', this._onSlideActivate, this);
        },

        _clearListeners: function () {
            if (this._showerListeners) {
                this._showerListeners.offAll();
            }
            if (this._playerListeners) {
                this._playerListeners.offAll();
            }
        },

        _onSlideActivate: function (slide) {
            var element = slide.get('target').getCurrentSlide().layout.getElement()
            this.playEverything(element);
        },
    });

    provide(Video);
});

shower.modules.require(['shower'], function (sh) {
    sh.plugins.add('shower-video');
});