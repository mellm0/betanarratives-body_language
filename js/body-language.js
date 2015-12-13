/*!
 * Start Bootstrap - Creative Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

(function ($) {
    var bl = {
            loaded: false,
            $game: $('#body-language-video'),
            $subtitle: $('#body-language-subtitle'),
            subtitle_text: '',
            focus_warning: ''
        },
        currentPlaying = {
            name: '',
            $element: null
        },
        $html = $('html'),
        $window = $(window),

        insertVideoInto = function ($element, video) {
            $element.html('<video autoplay class="page-video"><source src="AS3/media/clips/bl-' + video + '.mp4" type="video/mp4"></video>');
        },

        playerOrigin = '*',
        vimeo = function (action, value, origin, $players) {
            if (!origin) {
                origin = playerOrigin;
            }

            if (!$players) {
                $players = $('.page-video_embed');
            }

            var data = {
                method: action
            };

            if (value) {
                data.value = value;
            }

            var message = JSON.stringify(data);

            $players.each(function () {
                this.contentWindow.postMessage(message, playerOrigin);
            });
        }
        ;

    bl.setLoaded = function (loaded) {
        if (!loaded) {
            loaded = true;
        }

        bl.loaded = loaded;

        setTimeout(function () {
            bl.$game.each(function () {
                this.tabIndex = 1234;
                this.focus();
            });
        }, 50);
    };

    bl.subtitle = function (title) {
        if (bl.focus_warning) {
            bl.$subtitle.addClass('game-subtitle_active').text(bl.focus_warning);
        }
        else if (title) {
            bl.$subtitle.addClass('game-subtitle_active').text(title);
        }
        else if (bl.subtitle_text) {
            bl.$subtitle.addClass('game-subtitle_active').text(bl.subtitle_text);
        }
        else {
            bl.$subtitle.removeClass('game-subtitle_active');
        }
    };

    bl.piece = function (piece) {
        $window.scrollTop(0);

        $('.page-video_' + piece).each(function () {
            $html.addClass('page-video_playing');

            var $this = $(this);

            currentPlaying.name = piece;
            currentPlaying.$element = $this;

            $this.addClass('page-video_playing')
                .off("video:finished")
                .on("video:finished", function () {
                    bl.returnToGameFromPiece(piece, $this);
                });

            vimeo("play", '', '', $this);
        });

        $('.page-comics_' + piece).each(function () {
            $html.addClass('page-comic_active');

            var $this = $(this);

            currentPlaying.name = piece;
            currentPlaying.$element = $this;

            var $comic = $this.addClass('page-comic_active').find('.page-comic');

            if($comic.hasClass('credits')) {
                $comic.data('unslider').start();
            }
            else {
                $comic.focus();
            }
        });
    };

    bl.returnToGameFromPiece = function (name, $element) {
        $html.removeClass('page-video_playing page-comic_active');
        $element.removeClass('page-video_playing page-comic_active');

        if ($element.hasClass('page-video_embed')) {
            vimeo("unload", '', '', $element);
        }

        currentPlaying.name = '';
        currentPlaying.$element = null;
        bl.$game[0].game_return(name);
        bl.$game.focus();
    };

    window.bl = bl;

    $window
        .on('load', function () {
            bl.$game.focus();

            $('.page-video_embed').each(function () {

            });
        })
        .on('message', function (e) {
            var event = e.originalEvent;

            if (!(/^https?:\/\/player.vimeo.com/).test(event.origin)) {
                return false;
            }

            if (playerOrigin === '*') {
                playerOrigin = event.origin;
            }

            var data = JSON.parse(event.data),
                $players = data.player_id ? $('#' + data.player_id) : null;

            switch (data.event) {
                case 'ready':
                    vimeo('addEventListener', 'pause', playerOrigin, $players);
                    vimeo('addEventListener', 'finish', playerOrigin, $players);
                    vimeo('addEventListener', 'playProgress', playerOrigin, $players);

                    if ($players) {
                        $players.trigger("video:ready");
                    }
                    break;

                case 'playProgress':
                    if ($players) {
                        $players.trigger("video:playing");
                    }
                    break;

                case 'pause':
                    if ($players) {
                        $players.trigger("video:paused");
                    }
                    break;

                case 'finish':
                    if ($players) {
                        $players.trigger("video:finished");
                    }
                    break;
            }
        });

    $(document)
        .ready(function () {
            var sliderOptions = {
                credits: {
                    keys: false,
                    nav: false,
                    arrows: false,
                    delay: 10000
                },
                comic: {
                    keys: false,
                    nav: false
                }
            };

            $('.page-comic').each(function () {
                var $this = $(this);

                if ($this.hasClass('credits')) {
                    $this.unslider(sliderOptions.credits);
                }
                else {
                    $this.unslider(sliderOptions.comic);
                }
            });

            setInterval(function () {
                if (bl.loaded) {
                    if (bl.$game.is(':focus') && bl.focus_warning) {
                        bl.focus_warning = '';
                        bl.subtitle();
                    }
                    else if (!bl.$game.is(':focus') && !bl.focus_warning) {
                        bl.focus_warning = 'Please click the game to continue playing';
                        bl.subtitle();
                    }
                }

            }, 1000);
        })
        .keyup(function (e) {
            if (currentPlaying.name && e.keyCode == 27) {
                if(currentPlaying.$element && currentPlaying.$element.hasClass('page-comic-holder') && currentPlaying.$element.find('.page-comic').hasClass('credits')) {
                    window.location.href = '/about';
                }
                else {
                    bl.returnToGameFromPiece(currentPlaying.name, currentPlaying.$element);
                }
            }

            if (currentPlaying.$element && currentPlaying.$element.hasClass('page-comic-holder')) {
                var $comic = currentPlaying.$element.find('.page-comic'),
                    slider = $comic.data('unslider');

                if($comic.hasClass('credits')) {
                    if (e.keyCode == 37) {
                        if (slider.current == 0) {
                            //bl.returnToGameFromPiece(currentPlaying.name, currentPlaying.$element);
                        }
                        else {
                            slider.prev();
                        }
                    }
                    else if (e.keyCode == 39) {
                        if (slider.current == (slider.total - 1)) {
                            window.location.href = '/about';
                        }
                        else {
                            slider.next();
                        }
                    }
                }
                else {
                    if (e.keyCode == 37) {
                        if (slider.current == 0) {
                            bl.returnToGameFromPiece(currentPlaying.name, currentPlaying.$element);
                        }
                        else {
                            slider.prev();
                        }
                    }
                    else if (e.keyCode == 39) {
                        if (slider.current == (slider.total - 1)) {
                            bl.returnToGameFromPiece(currentPlaying.name, currentPlaying.$element);
                        }
                        else {
                            slider.next();
                        }
                    }
                }
            }

            bl.piece('credits');
        });
})(jQuery); // End of use strict