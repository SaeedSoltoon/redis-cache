( function ( $, root, undefined ) {
    root.rediscache = root.rediscache || {};
    var rediscache = root.rediscache;

    $.extend( rediscache, {
        metrics: {
            computed: null,
            names: {
                h: 'hits',
                m: 'misses',
                r: 'ratio',
                b: 'bytes',
                t: 'time',
                c: 'calls',
            },
        },
        chart: null,
        chart_defaults: {
            noData: {
                text: root.rediscache_metrics
                    ? rediscache.l10n.no_data
                    : rediscache.l10n.no_cache,
                align: 'center',
                verticalAlign: 'middle',
                offsetY: -25,
                style: {
                    color: '#72777c',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                }
            },
            stroke: {
                width: [2, 2],
                curve: 'smooth',
                dashArray: [0, 8],
            },
            colors: [
                '#0096dd',
                '#72777c',
            ],
            annotations: {
                texts: [{ x: '15%', y: '30%', fontSize: '20px', fontWeight: 600, fontFamily: 'inherit', foreColor: '#72777c' }],
            },
            chart: {
                type: 'line',
                height: '100%',
                toolbar: { show: false },
                zoom: { enabled: false },
                animations: { enabled: false }
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false,
            },
            fill: {
                opacity: [0.25, 1],
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    format: 'HH:mm',
                    datetimeUTC: false,
                    style: { colors: '#72777c', fontSize: '13px', fontFamily: 'inherit' },
                },
                tooltip: { enabled: false },
            },
            yaxis: {
                type: 'numeric',
                tickAmount: 4,
                min: 0,
                labels: {
                    style: { colors: '#72777c', fontSize: '13px', fontFamily: 'inherit' },
                    formatter: function (value) {
                        return Math.round(value);
                    },
                },
            },
            tooltip: {
                fixed: {
                    enabled: true,
                    position: 'bottomLeft',
                    offsetY: 30,
                    offsetX: 0,
                },
            }
        },
        templates: {
            tooltip_title: _.template(
                '<div class="apexcharts-tooltip-title"><%- title %></div>'
            ),
            series_group: _.template(
                '<div class="apexcharts-tooltip-series-group">' +
                '  <span class="apexcharts-tooltip-marker" style="background-color: <%- color %>;"></span>' +
                '  <div class="apexcharts-tooltip-text">' +
                '    <div class="apexcharts-tooltip-y-group">' +
                '      <span class="apexcharts-tooltip-text-label"><%- name %>:</span>' +
                '      <span class="apexcharts-tooltip-text-value"><%- value %></span>' +
                '    </div>' +
                '  </div>' +
                '</div>'
            ),
            series_pro: _.template(
                '<div class="apexcharts-tooltip-series-group">' +
                '  <span class="apexcharts-tooltip-marker" style="background-color: <%- color %>;"></span>' +
                '  <div class="apexcharts-tooltip-text">' +
                '    <div class="apexcharts-tooltip-y-group">' +
                '      <span class="apexcharts-tooltip-text-label"><%- name %></span>' +
                '    </div>' +
                '  </div>' +
                '</div>'
            ),
        }
    } );

    // Build the charts by deep extending the chart defaults
    $.extend( rediscache, {
        charts: {
            time: $.extend( true, {}, rediscache.chart_defaults, {
                yaxis: {
                    labels: {
                        formatter: function ( value ) {
                            return Math.round(value) + ' ms';
                        },
                    },
                },
                tooltip: {
                    custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                        return [
                            rediscache.templates.tooltip_title({
                                title: new Date( w.globals.seriesX[seriesIndex][dataPointIndex] ).toTimeString().slice( 0, 5 ),
                            }),
                            rediscache.templates.series_group({
                                color: rediscache.chart_defaults.colors[0],
                                name: w.globals.seriesNames[0],
                                value: series[0][dataPointIndex].toFixed(2) + ' ms',
                            }),
                            rediscache.templates.series_pro({
                                color: rediscache.chart_defaults.colors[1],
                                name: rediscache.l10n.pro,
                            }),
                        ].join('');
                    },
                },
            } ),
            bytes: $.extend( true, {}, rediscache.chart_defaults, {
                dataLabels: {
                    enabled: true,
                },
                legend: {
                    show: true,
                },
                yaxis: {
                    labels: {
                        formatter: function ( value ) {
                            return Math.round( value / 1024 ) + ' KB';
                        },
                    },
                },
                tooltip: {
                    custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                        return [
                            rediscache.templates.tooltip_title({
                                title: new Date( w.globals.seriesX[seriesIndex][dataPointIndex] ).toTimeString().slice( 0, 5 ),
                            }),
                            rediscache.templates.series_group({
                                color: rediscache.chart_defaults.colors[0],
                                name: w.globals.seriesNames[0],
                                value: Math.round( series[0][dataPointIndex] / 1024 ) + ' kb',
                            }),
                            rediscache.templates.series_pro({
                                color: rediscache.chart_defaults.colors[1],
                                name: rediscache.l10n.pro,
                            }),
                        ].join('');
                    },
                },
            } ),
            ratio: $.extend( true, {}, rediscache.chart_defaults, {
                yaxis: {
                    max: 100,
                    labels: {
                        formatter: function ( value ) {
                            return Math.round( value ) + '%';
                        },
                    },
                },
                tooltip: {
                    custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                        return [
                            rediscache.templates.tooltip_title({
                                title: new Date( w.globals.seriesX[seriesIndex][dataPointIndex] ).toTimeString().slice( 0, 5 ),
                            }),
                            rediscache.templates.series_group({
                                color: rediscache.chart_defaults.colors[0],
                                name: w.globals.seriesNames[0],
                                value: Math.round( series[0][dataPointIndex] * 100 ) / 100 + '%',
                            }),
                        ].join('');
                    },
                },
            } ),
            calls: $.extend( true, {}, rediscache.chart_defaults, {
                tooltip: {
                    custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                        return [
                            rediscache.templates.tooltip_title({
                                title: new Date( w.globals.seriesX[seriesIndex][dataPointIndex] ).toTimeString().slice( 0, 5 ),
                            }),
                            rediscache.templates.series_group({
                                color: rediscache.chart_defaults.colors[0],
                                name: w.globals.seriesNames[0],
                                value: Math.round( series[0][dataPointIndex] ),
                            }),
                            rediscache.templates.series_pro({
                                color: rediscache.chart_defaults.colors[1],
                                name: rediscache.l10n.pro,
                            }),
                        ].join('');
                    },
                },
            } ),
        },
    } );

    var compute_metrics = function ( raw_metrics, metric_names ) {
        var metrics = {};

        // parse raw metrics in blocks of minutes
        for ( var entry in raw_metrics ) {
            var values = {};
            var timestamp = raw_metrics[ entry ];
            var minute = ( timestamp - timestamp % 60 ) * 1000;

            entry.split( ';' ).forEach(
                function ( value ) {
                    var metric = value.split( '=' );

                    if ( metric_names[ metric[0] ] ) {
                          values[ metric_names[ metric[0] ] ] = Number( metric[1] );
                    }
                }
            );

            if ( ! metrics[ minute ] ) {
                metrics[ minute ] = [];
            }

            metrics[ minute ].push( values );
        }

        // calculate median value for each block
        for ( var entry in metrics ) {
            if ( metrics[ entry ].length === 1 ) {
                metrics[ entry ] = metrics[ entry ].shift();
                continue;
            }

            var medians = {};

            for ( var key in metric_names ) {
                var name = metric_names[ key ];

                medians[ name ] = compute_median(
                    metrics[ entry ].map(
                        function ( metric ) {
                            return metric[ name ];
                        }
                    )
                )
            }

            metrics[ entry ] = medians;
        }

        var computed = [];

        for ( var timestamp in metrics ) {
            var entry = metrics[ timestamp ];

            entry.date = Number( timestamp );
            entry.time = entry.time * 1000;

            computed.push( entry );
        }

        computed.sort(
            function( a, b ) {
                return a.date - b.date;
            }
        );

        console.log(computed.length);

        return computed.length < 2 ? [] : computed;
    };

    var compute_median = function ( numbers ) {
        var median = 0;
        var numsLen = numbers.length;

        numbers.sort();

        if ( numsLen % 2 === 0 ) {
            median = ( numbers[ numsLen / 2 - 1 ] + numbers[ numsLen / 2 ] ) / 2;
        } else {
            median = numbers[ ( numsLen - 1 ) / 2 ];
        }

        return median;
    };

    var render_chart = function ( id ) {
        if ( rediscache.chart ) {
            rediscache.chart.updateOptions( rediscache.charts[id] );
            return;
        }

        var chart = new ApexCharts(
            document.querySelector( '#redis-stats-chart' ),
            rediscache.charts[id]
        );

        chart.render();
        root.rediscache.chart = chart;
    };

    var setup_charts = function () {
        var time = rediscache.metrics.computed.map(
            function ( entry ) {
                return [entry.date, entry.time];
            }
        );

        // var timeMedian = compute_median(
        //     time.map(
        //         function ( entry ) {
        //             return entry[1];
        //         }
        //     )
        // );

        var bytes = rediscache.metrics.computed.map(
            function ( entry ) {
                return [entry.date, entry.bytes];
            }
        )

        // var bytesMedian = compute_median(
        //     bytes.map(
        //         function ( entry ) {
        //             return entry[1];
        //         }
        //     )
        // );

        var ratio = rediscache.metrics.computed.map(
            function ( entry ) {
                return [entry.date, entry.ratio];
            }
        );

        // var ratioMedian = compute_median(
        //     ratio.map(
        //         function ( entry ) {
        //             return entry[1];
        //         }
        //     )
        // );

        var calls = rediscache.metrics.computed.map(
            function ( entry ) {
                return [entry.date, entry.calls];
            }
        );

        // var callsMedian = compute_median(
        //     calls.map(
        //         function ( entry ) {
        //             return entry[1];
        //         }
        //     )
        // );

        rediscache.charts.time.series = [{
            name: 'Time',
            type: 'area',
            data: time,
        }, {
            name: 'Pro',
            type: 'line',
            data: time.map(
                function ( entry ) {
                    return [entry[0], entry[1] * 0.5];
                }
            ),
        } ];

        // rediscache.charts.time.annotations.texts[0].text = Math.round( timeMedian ) + ' ms';

        rediscache.charts.bytes.series = [{
            name: rediscache.l10n.bytes,
            type: 'area',
            data: bytes,
        }, {
            name: 'Pro',
            type: 'line',
            data: bytes.map(
                function ( entry ) {
                    return [entry[0], entry[1] * 0.3];
                }
            ),
        } ];

        // rediscache.charts.bytes.annotations.texts[0].text = Math.round( bytesMedian / 1024 ) + ' KB';

        rediscache.charts.ratio.series = [{
            name: rediscache.l10n.ratio,
            type: 'area',
            data: ratio,
        }];

        // rediscache.charts.ratio.annotations.texts[0].text = Math.round( ratioMedian ) + '%';

        rediscache.charts.calls.series = [{
            name: rediscache.l10n.calls,
            type: 'area',
            data: calls,
        }, {
            name: 'Pro',
            type: 'line',
            data: calls.map(
                function ( entry ) {
                    return [entry[0], Math.round( entry[1] / 50 ) + 5];
                }
            ),
        } ];

        // rediscache.charts.calls.annotations.texts[0].text = Math.round( callsMedian );
    };

    // executed on page load
    $(function () {
    
        var $tabs = $('#redis-tabs');
        $tabs.find('a').on(
            'click.redis',
            function () {
                var $this = $(this),
                    $target = $($this.data('target'));
                $tabs.find('a').removeClass('nav-tab-active');
                $('.section').removeClass('active');
                $target.addClass('active');
                $this.addClass('nav-tab-active');
                $(window).trigger('redis-tab-change', $target);
            }
        );

        if ($('#widget-redis-stats').length) {
            rediscache.metrics.computed = compute_metrics(
                root.rediscache_metrics,
                rediscache.metrics.names
            );

            setup_charts();
            render_chart('time');
        }

        $('#widget-redis-stats ul a').on(
            'click.redis',
            function (event) {
                event.preventDefault();

                $('#widget-redis-stats .active').removeClass('active');
                $(this).blur().addClass('active');

                render_chart(
                    $(event.target).data('chart')
                );
            }
        );

        $('.notice.is-dismissible[data-dismissible]').on(
            'click.roc-dismiss-notice',
            '.notice-dismiss',
            function (event) {
                event.preventDefault();

                $.post(ajaxurl, {
                    notice: $(this).parent().attr('data-dismissible'),
                    action: 'roc_dismiss_notice',
                });
            }
        );
    });

} ( window[rediscache.jQuery], window ) );
