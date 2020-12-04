            var back_music = document.getElementById("back_music");
            var play_function = function () {
                back_music.play();
                back_music.loop = true;
            };

            var pause_function = function () {
                var back_music = document.getElementById("back_music");
                back_music.pause();
            };

            var w_inner = window.innerWidth;
            var h_inner = window.innerHeight;

            var w = w_inner;
            var h = w * 0.6;

            var unit = w / 1000;

            var margin = {
                top: 100 * unit,
                bottom: 100 * unit,
                right: 80 * unit,
                left: 80 * unit,
            };
            var width = w - margin.left - margin.right;
            var height = h - margin.top - margin.bottom;
            var width_m = width + margin.left + margin.right;
            var height_m = height + margin.top + margin.bottom;
            window.onresize = function (event) {
                if (window.innerWidth != w) {
                    document.location.reload(true);
                }
            }
            var svg = d3.select("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var play_button = svg
                .append("g")
                .classed("play", true)
                .attr("transform", `translate(${width + (30 * unit)}, ${-70 * unit})`)
                .style("pointer-events", "auto")
                .each(function () {
                    d3.select(this)
                        .append("path")
                        .attr("class", "sfx_play")
                        .attr("d", `M0 ${(3 * unit)} L${(3 * unit)} 0 L0 ${(-3 * unit)} `)
                        .style("stroke", "grey")
                        .style("stroke-width", `${0.7 * unit}`)

                    d3.select(this)
                        .append("path")
                        .attr("class", "sfx_pause")
                        .attr("d", `M0 ${(3 * unit)} L0 ${(-3 * unit)}`)
                        .style("stroke", "grey")
                        .style("stroke-width", `${0.7 * unit}`)
                        .style("opacity", 0)

                    d3.select(this)
                        .append("path")
                        .attr("class", "sfx_pause")
                        .attr("d", `M${(3 * unit)} ${(3 * unit)} L${(3 * unit)} ${(-3 * unit)}`)
                        .style("stroke", "grey")
                        .style("stroke-width", `${0.7 * unit}`)
                        .style("opacity", 0)


                    d3.select(this)
                        .append("circle")
                        .attr("class", "sfx_button")
                        .attr("cx", `${(1.5 * unit)}`)
                        .attr("cy", 0)
                        .attr("r", `${6 * unit}`)
                        .style("fill", "black")
                        .style("fill-opacity", 0)
                        .style("stroke", "grey")
                        .style("stroke-width", `${0.7 * unit}`)
                        .on("mousedown", function () {
                            if (d3.select(this).style("fill") == "black") {
                                d3.select(this).style("fill", "#dbdbdb");
                                d3.selectAll(".sfx_pause").style("opacity", 1)
                                d3.selectAll(".sfx_play").style("opacity", 0)
                                play_function();
                            } else {
                                d3.select(this).style("fill", "black");
                                d3.selectAll(".sfx_pause").style("opacity", 0)
                                d3.selectAll(".sfx_play").style("opacity", 1)
                                pause_function();
                            }
                        })
                        .on("mouseover", function () {
                            d3.select(this).style("stroke", "white")
                            d3.select(".sfx_play").style("stroke", "white")
                            d3.selectAll(".sfx_pause").style("stroke", "white")
                        })
                        .on("mouseout", function () {
                            d3.select(this).style("stroke", "grey")
                            d3.select(".sfx_play").style("stroke", "grey")
                            d3.selectAll(".sfx_pause").style("stroke", "grey")
                        })

                    d3.select(this)
                        .append("text")
                        .classed("play_text", true)
                        .attr("x", `${12 * unit}`)
                        .attr("y", `${0.75 * unit}`)
                        .text("SFX")
                        .style("fill", "grey")
                        .style("alignment-baseline", "middle")
                        .style("font-size", (d) => `${8 * unit}px`)
                })
            var canvas = d3.select("#viz_container")
                .append("canvas")
                .attr("id", "canvas")
                .attr("width", w - margin.left)
                .attr("height", h - margin.top);
            var ctx = canvas.node().getContext("2d");
            ctx.translate(margin.left, margin.top);
            var data_file =
                "https://raw.githubusercontent.com/mohamadwaked/alhadaqa_projects/master/pompeii_dataset.csv";
            var geo_file = "https://raw.githubusercontent.com/mohamadwaked/alhadaqa_projects/master/world_map.geojson";
            var raw_dataset, flower_category_dataset, flower_subcategory_dataset;
            var flowers_data, flowers_timeline_cores_data, flowers_continent_data, flowers_country_data;
            var disasters_deaths_by_category_dataset;
            var disasters_deaths_by_subcategory_dataset;
            var disasters_deaths_by_decade_dataset;
            var disasters_deaths_by_continent_dataset;
            var disasters_deaths_by_country_dataset;
            var projection = d3.geoNaturalEarth1()
                .scale((200 * unit))
                .translate([(width / 2) - (80 * unit), (height / 2) + (40 * unit)]);
            var geo_path = d3.geoPath().projection(projection);
            var map = {};
            var data_converter = function (point) {
                return {
                    year: +point.start,
                    decade: +point.decade,
                    decade_year: +point.decade_year,
                    category: point.category,
                    subcategory: point.subcategory,
                    type: point.type,
                    subtype: point.subtype,
                    event_name: point.event_name,
                    continent: point.continent,
                    region: point.region,
                    country: point.country,
                    iso: point.iso,
                    longitude: +point.longitude,
                    latitude: +point.latitude,
                    coordinates: [+point.longitude, +point.latitude],
                    deaths: +point.deaths,
                    affected: +point.affected,
                    deaths_affected: +point.deaths_affected,
                    random_x: +point.random_x,
                    random_y: +point.random_y,
                };
            };
            Promise.all([d3.csv(data_file, data_converter), d3.json(geo_file)]).then(function ([data, shapes]) {
                raw_dataset = data;
                var raw_dataset_sort = function (a, b) {
                    return a.year - b.year;
                };

                raw_dataset = raw_dataset.sort(
                    raw_dataset_sort
                );
                flower_category_dataset = [
                    "Climatological",
                    "Geophysical",
                    "Hydrological",
                    "Meteorological",
                    "Biological",
                ];
                flower_subcategory_dataset = [
                    "Drought",
                    "Wildfire",

                    "Earthquake",
                    "Mass_Movement",
                    "Volcanic_Activity",

                    "Flood",
                    "Landslide",

                    "Extreme_Temperature",
                    "Fog",
                    "Storm",

                    "Epidemic",
                    "COVID19",
                ];
                disasters_deaths_by_category_dataset = d3.nest()
                    .key((k) => k.category)
                    .rollup((v) => {
                        return {
                            category: v[0].category,
                            disasters: v.length,
                            deaths: d3.sum(v, (d) => d.deaths),
                        };
                    })
                    .entries(raw_dataset);
                disasters_deaths_by_category_dataset = disasters_deaths_by_category_dataset.map((d, i) => {
                    return {
                        category: d.value.category,
                        disasters: d.value.disasters,
                        deaths: d.value.deaths,
                    };
                });
                var disasters_deaths_by_category_sort = function (a, b) {
                    return b.deaths - a.deaths;
                };

                disasters_deaths_by_category_dataset = disasters_deaths_by_category_dataset.sort(
                    disasters_deaths_by_category_sort
                );
                disasters_deaths_by_subcategory_dataset = d3.nest()
                    .key((k) => k.subcategory)
                    .rollup((v) => {
                        return {
                            subcategory: v[0].subcategory,
                            type: v[0].type,
                            category: v[0].category,
                            disasters: v.length,
                            deaths: d3.sum(v, (d) => d.deaths),
                        };
                    })
                    .entries(raw_dataset);
                disasters_deaths_by_subcategory_dataset = disasters_deaths_by_subcategory_dataset.map((d,
                    i) => {
                    return {
                        subcategory: d.value.subcategory,
                        type: d.value.type,
                        category: d.value.category,
                        disasters: d.value.disasters,
                        deaths: d.value.deaths,
                    };
                });
                var disasters_deaths_by_subcategory_sort = function (a, b) {
                    return b.deaths - a.deaths;
                };

                disasters_deaths_by_subcategory_dataset = disasters_deaths_by_subcategory_dataset.sort(
                    disasters_deaths_by_subcategory_sort
                );
                disasters_deaths_by_decade_dataset = d3.nest()
                    .key((k) => k.decade)
                    .rollup((v) => {
                        return {
                            decade: v[0].decade,
                            disasters: v.length,
                            deaths: d3.sum(v, (d) => d.deaths),
                        };
                    })
                    .entries(raw_dataset);
                disasters_deaths_by_decade_dataset = disasters_deaths_by_decade_dataset.map((d, i) => {
                    return {
                        decade: d.value.decade,
                        disasters: d.value.disasters,
                        deaths: d.value.deaths,
                    };
                });
                var disasters_deaths_by_decade_sort = function (a, b) {
                    return a.decade - b.decade;
                };

                disasters_deaths_by_decade_dataset = disasters_deaths_by_decade_dataset.sort(
                    disasters_deaths_by_decade_sort
                );
                disasters_deaths_by_continent_dataset = d3.nest()
                    .key((k) => k.continent)
                    .rollup((v) => {
                        return {
                            continent: v[0].continent,
                            disasters: v.length,
                            deaths: d3.sum(v, (d) => d.deaths),
                        };
                    })
                    .entries(raw_dataset);
                disasters_deaths_by_continent_dataset = disasters_deaths_by_continent_dataset.map((d, i) => {
                    return {
                        continent: d.value.continent,
                        disasters: d.value.disasters,
                        deaths: d.value.deaths,
                    };
                });
                var disasters_deaths_by_continent_sort = function (a, b) {
                    return b.disasters - a.disasters;
                };

                disasters_deaths_by_continent_dataset = disasters_deaths_by_continent_dataset.sort(
                    disasters_deaths_by_continent_sort
                );
                disasters_deaths_by_country_dataset = d3.nest()
                    .key((k) => k.country)
                    .rollup((v) => {
                        return {
                            country: v[0].country,
                            coordinates: [v[0].longitude, v[0].latitude],
                            disasters: v.length,
                            deaths: d3.sum(v, (d) => d.deaths),
                        };
                    })
                    .entries(raw_dataset);
                disasters_deaths_by_country_dataset = disasters_deaths_by_country_dataset.map((d, i) => {
                    return {
                        country: d.value.country,
                        coordinates: d.value.coordinates,
                        disasters: d.value.disasters,
                        deaths: d.value.deaths,
                    };
                });

                var disasters_deaths_by_country_sort = function (a, b) {
                    return b.disasters - a.disasters;
                };

                disasters_deaths_by_country_dataset = disasters_deaths_by_country_dataset.sort(
                    disasters_deaths_by_country_sort
                );
                map.features = shapes.features; // save data in global context

                viz_draw();

            });

            function viz_draw() {
                d3.select("#story_container").style("font-size", (d) => `${10 * unit}px`);
                var flower_category_serial_domain = flower_category_dataset;
                var flower_category_serial_range = [1, 2, 3, 4, 5];

                var flower_category_serial_scale = d3
                    .scaleOrdinal()
                    .domain(flower_category_serial_domain)
                    .range(flower_category_serial_range);
                var flower_area_domain = [100, 4000000];
                var flower_area_range = [2.9 * unit, 28 * unit];

                var flower_area_scale = d3.scaleSqrt()
                    .domain(flower_area_domain)
                    .range(flower_area_range);
                var flower_subcategory_color_domain = flower_subcategory_dataset;

                var flower_subcategory_hex_range = [
                    "#f4b431",
                    "#ff7300",

                    "#28de40",
                    "#a17b4d",
                    "#ee1110",

                    "#23cdf7",
                    "#a200ff",

                    "#3030ff",
                    "#999999",
                    "#e4edec",

                    "#ff6bc4",
                    "#eb36a2",
                ]; // for HEX color values

                var flower_subcategory_rgba_range = [
                    "rgba(244, 180, 49", // yellow - Drought_Climatological
                    "rgba(255, 115, 0", // dark orange - Wildfire_Climatological

                    "rgba(40, 222, 64", // green - Earthquake_Geophysical 109, 217, 0
                    "rgba(161, 123, 77", // brown - Mass Movement_Geophysical
                    "rgba(238, 17, 16", // red - Volcanic Activity_Geophysical

                    "rgba(35, 205, 247", // max, light blue - Flood_Hydrological
                    "rgba(162, 0, 255", // min, dark blue - Landslide_Hydrological

                    "rgba(48, 48, 255", // min, dark blue - Extreme Temperature_Meteorological
                    "rgba(153, 153, 153", // 1 point, mid blue - Fog_Meteorological
                    "rgba(228, 237, 236", // max, white - Storm_Meteorological

                    "rgba(255, 107, 196", // violet, Biological_Epidemic
                    "rgba(235, 54, 162", // violet, Biological_Epidemic COVID19
                ];

                var flower_subcategory_hex_scale = d3
                    .scaleOrdinal()
                    .domain(flower_subcategory_color_domain)
                    .range(flower_subcategory_hex_range);

                var flower_subcategory_rgba_scale = d3
                    .scaleOrdinal()
                    .domain(flower_subcategory_color_domain)
                    .range(flower_subcategory_rgba_range);
                var flower_subcategory_txt_color_domain = flower_subcategory_dataset;

                var flower_subcategory_txt_rgba_range = [
                    "rgba(255, 202, 97", // yellow - Drought_Climatological
                    "rgba(255, 143, 51", // dark orange - Wildfire_Climatological

                    "rgba(55, 222, 141", // green - Earthquake_Geophysical
                    "rgba(212, 164, 106", // brown - Mass Movement_Geophysical
                    "rgba(255, 71, 71", // red - Volcanic Activity_Geophysical

                    "rgba(80, 210, 242", // max, light blue - Flood_Hydrological
                    "rgba(204, 132, 245", // min, dark blue - Landslide_Hydrological

                    "rgba(84, 152, 255", // min, dark blue - Extreme Temperature_Meteorological
                    "rgba(180, 180, 180", // 1 point, mid blue - Fog_Meteorological
                    "rgba(186, 255, 247", // max, white - Storm_Meteorological

                    "rgba(255, 148, 212", // violet, Biological_Epidemic
                    "rgba(255, 94, 190", // violet, Biological_Epidemic COVID19
                ];

                var flower_subcategory_txt_rgba_scale = d3
                    .scaleOrdinal()
                    .domain(flower_subcategory_txt_color_domain)
                    .range(flower_subcategory_txt_rgba_range);
                var random_over_x_axis_scale = d3
                    .scaleLinear()
                    .domain([1900, 2020])
                    .range([-(40 * unit), width + (40 * unit)]);

                var random_over_y_axis_scale = d3
                    .scaleLinear()
                    .domain([0, 1])
                    .range([height + (50 * unit), -(62 * unit)]);
                var big_flower_radial_domain = [1820, 2020];
                var big_flower_inner_raduis = 0;
                var big_flower_outer_raduis = d3.min([width, height]) * 0.5;

                var big_flower_radial_scale = d3.scaleLinear()
                    .domain(big_flower_radial_domain)
                    .range([big_flower_inner_raduis, big_flower_outer_raduis - 10]);

                // calculate angle slice
                var big_flower_angle_slice = (Math.PI * 2) / 5;
                var category_x_domain = [
                    "Biological", // Epidemic
                    "Climatological", // Drought, Wildfire
                    "Geophysical", // Earthquake, Mass Movement, Volcanic Activity
                    "Hydrological", // Flood, Landslide
                    "Meteorological", // Extreme Temperature, Fog, Storm
                ];

                var category_to_serial = d3.scaleOrdinal()
                    .domain(category_x_domain)
                    .range([0.2, 3, 4.7, 7.2, 9.4]);

                var category_x_scale = d3.scaleLinear()
                    .domain([0, 10])
                    .range([((0 * width) + (40 * unit)), ((1 * width) - (30 * unit))]);

                // category_x_scale(category_to_serial(d.category));

                var deaths_y_scale = d3.scaleLinear()
                    .domain([0, 12000000])
                    .range([height - (30 * unit), (50 * unit)]);
                var subcategory_x_domain = [
                    "Epidemic", // Epidemic

                    "Wildfire", // Climatological
                    "Drought", // Climatological

                    "Volcanic_Activity", // Geophysical
                    "Earthquake", // Geophysical
                    "Mass_Movement", // Geophysical

                    "Landslide", // Hydrological
                    "Flood", // Hydrological

                    "Extreme_Temperature", // Meteorological
                    "Storm", // Meteorological
                    "Fog", // Meteorological
                ];

                var subcategory_to_serial = d3.scaleOrdinal()
                    .domain(subcategory_x_domain)
                    .range([0.2, 2, 3, 3.5, 4.7, 5.8, 6.7, 7.2, 8, 9.4, 10.5]);

                var subcategory_x_scale = d3.scaleLinear()
                    .domain([0, 10])
                    .range([((0 * width) + (40 * unit)), ((1 * width) - (30 * unit))]);
                var core_area_domain = [1000000, 12000000]; //d3.extent(raw_dataset, (d) => d.deaths);
                var core_area_range = [40 * unit, 90 * unit]; //[3.5, 40];

                var core_area_scale = d3.scaleSqrt()
                    .domain(core_area_domain)
                    .range(core_area_range);
                var main_timeline_x_scale = d3.scaleLinear()
                    .domain([1, 10])
                    .range([0, width]);

                var main_timeline_y_scale = d3.scaleLinear()
                    .domain([1, 10])
                    .range([height + (10 * unit), (30 * unit)]);
                var small_flower_radial_domain = [0, 10];
                var small_flower_inner_raduis = 25 * unit;
                var small_flower_outer_raduis = 65 * unit;

                var small_flower_radial_scale = d3.scaleLinear()
                    .domain(small_flower_radial_domain)
                    .range([small_flower_inner_raduis, small_flower_outer_raduis]);

                // calculate angle slice
                var small_flower_angle_slice = (Math.PI * 2) / 5;
                var continent_x_domain = [
                    "Americas",
                    "Europe",
                    "Africa",
                    "Asia",
                    "Oceania",
                ];

                var continent_to_x = d3.scaleOrdinal()
                    .domain(continent_x_domain)
                    .range([0.2, 3.5, 4, 7.7, 10.2]);

                var continent_x_scale = d3.scaleLinear()
                    .domain([0, 10])
                    .range([((0 * width) + (40 * unit)), ((1 * width) - (30 * unit))]);

                // category_x_scale(category_to_serial(d.category));
                var continent_to_y = d3.scaleOrdinal()
                    .domain(continent_x_domain)
                    .range([5, 9.5, 1.5, 7, 1.5]);

                var continent_y_scale = d3.scaleLinear()
                    .domain([0, 10])
                    .range([height - (30 * unit), (30 * unit)]);
                var continent_flower_domain = [
                    "Americas",
                    "Europe",
                    "Africa",
                    "Asia",
                    "Oceania",
                ];

                var continent_flower_radial_domain = [1820, 2020];


                var continent_to_inner_r = d3.scaleOrdinal()
                    .domain(continent_flower_domain)
                    .range([(0 * unit), (0 * unit), (0 * unit), (0 * unit), (0 * unit)]);

                var continent_to_outer_r = d3.scaleOrdinal()
                    .domain(continent_flower_domain)
                    .range([(80 * unit), (70 * unit), (90 * unit), (160 * unit), (40 * unit)]);

                var continent_flower_radial_scale;

                var continent_to_domain_and_range = function (decade_year, continent) {
                    continent_flower_radial_scale = d3.scaleLinear()
                        .domain(continent_flower_radial_domain)
                        .range([continent_to_inner_r(continent), continent_to_outer_r(continent)]);

                    return continent_flower_radial_scale(decade_year);
                };
                var continent_flower_angle_slice = (Math.PI * 2) / 5;
                var year_x_scale = d3
                    .scaleLinear()
                    .domain([1900, 2020])
                    .range([0, width]);

                var severe_disasters_y_scale = d3
                    .scaleLinear()
                    .domain([0, 4000000])
                    .range([height, 0]);
                var flower_radial_gradient = svg
                    .append("defs")
                    .selectAll("radialGradient")
                    .data(flower_subcategory_dataset)
                    .enter()
                    .append("radialGradient")
                    .attr("id", function (d) {
                        return "gradient_" + d;
                    })
                    .attr("cx", "50%")
                    .attr("cy", "50%")
                    .attr("r", "55%");

                //Append the color stops
                flower_radial_gradient
                    .append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", (d, i) => `rgba(255, 255, 255,1)`);
                flower_radial_gradient
                    .append("stop")
                    .attr("offset", "20%")
                    .attr("stop-color", (d, i) => `${flower_subcategory_rgba_scale(d)},1)`);
                flower_radial_gradient
                    .append("stop")
                    .attr("offset", "50%")
                    .attr("stop-color", (d, i) => `${flower_subcategory_rgba_scale(d)},0.8)`);
                flower_radial_gradient
                    .append("stop")
                    .attr("offset", "80%")
                    .attr("stop-color", (d, i) => `${flower_subcategory_rgba_scale(d)},1)`);
                flower_radial_gradient
                    .append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", (d, i) => `${flower_subcategory_rgba_scale(d)},0.4)`);
                var core_radial_gradient = svg
                    .append("defs")
                    .selectAll("radialGradient")
                    .data(flower_category_dataset)
                    .enter()
                    .append("radialGradient")
                    .attr("id", function (d) {
                        return "gradient_" + d;
                    })
                    .attr("cx", "50%")
                    .attr("cy", "50%")
                    .attr("r", "55%");

                //Append the color stops
                var core_radial_gradient = svg.append("defs")
                    .append("radialGradient")
                    .attr("id", "core_gradient")
                    .attr("cx", "50%") //not really needed, since 50% is the default
                    .attr("cy", "50%") //not really needed, since 50% is the default
                    .attr("r", "50%") //not really needed, since 50% is the default
                    .selectAll("stop")
                    .data([{
                            offset: "0%",
                            color: "rgba(0, 0, 0, 1)"
                        },
                        {
                            offset: "20%",
                            color: "rgba(0, 0, 0, 1)"
                        },
                        {
                            offset: "85%",
                            color: "rgba(156, 123, 123, 0.1)"
                        },
                        {
                            offset: "90%",
                            color: "rgba(201, 181, 181, 1)"
                        },
                        {
                            offset: "100%",
                            color: "rgba(156, 123, 123, 0.7)"
                        },
                    ])
                    .enter()
                    .append("stop")
                    .attr("offset", function (d) {
                        return d.offset;
                    })
                    .attr("stop-color", function (d) {
                        return d.color;
                    });
                var natural_flowers_group, natural_flowers,
                    natural_big_flower_stems_group, natural_big_flower_core, natural_big_flower_stems,
                    natural_big_flower_center, natural_big_flower_grid_circles;

                var natural_category_flowers_stem_group, natural_category_flowers_cores, natural_category_flowers_stems,
                    natural_category_flowers_annotation;

                var natural_subcategory_flowers_stem_group, natural_subcategory_flowers_cores,
                    natural_subcategory_flowers_stems, natural_subcategory_flowers_annotation;

                var main_timeline_group, main_timeline, main_timeline_scale, get_point_of_main_timeline,
                    main_timeline_annotation;

                var flowers_timeline_group, flowers_timeline_scale, get_point_of_flowers_timeline,
                    flowers_timeline_cores_group, flowers_timeline_cores,
                    flowers_timeline_stems, flowers_timeline_annotation;

                var continent_flowers_group, continent_flowers_scale, get_point_of_continent_flowers,
                    continent_flowers_stem_group, continent_flowers_cores,
                    continent_flowers_stems, continent_flowers_annotation;

                var country_flowers_annotation, country_flowers_annotation_group;
                var country_flowers_group, country_flowers_scale,
                    country_flowers_cores, country_flowers_annotation;

                var severe_disasters_stems, severe_disasters_line_group, severe_disasters_annotation_year,
                    severe_disasters_annotation;
                natural_flowers_group = svg.append("g")
                    .classed("natural_flower_group", true)
                    .style("pointer-events", "auto");
                // start of function
                var natural_flower_creator = (function () {
                    var single_flower_data = function () {
                        var data = [];
                        for (var i = 0; i < 100; i++) {
                            var random_number = Math.round(Math.random() * 10);
                            data.push(random_number);
                        }
                        return data;
                    };
                    var all_flowers_data = function () {
                        var data = [];
                        for (var i = 0; i < raw_dataset.length; i++) {
                            var random = single_flower_data();
                            data.push(random);
                        }
                        return data;
                    };
                    flowers_data = all_flowers_data();
                    var angular_domain = [0, single_flower_data().length];
                    var angular_range = [0, 2 * Math.PI];
                    var angular_scale = d3.scaleLinear().domain(angular_domain).range(angular_range);
                    var radial_domain = [0, d3.max(single_flower_data())];

                    var inner_radius = 0.6;
                    var outer_radius = 1;

                    var radial_range = [inner_radius, outer_radius];

                    var radial_scale = d3.scaleLinear().domain(radial_domain).range(radial_range);
                    var radial_line_creator = d3
                        .lineRadial()
                        .angle((d, i) => angular_scale(i))
                        .radius((d) => radial_scale(d))
                        .curve(d3.curveBasisClosed);
                    natural_flowers = natural_flowers_group
                        .selectAll("path.natural_flowers")
                        .data(raw_dataset)
                        .enter()
                        .append("path")
                        .classed("natural_flowers", true)
                        .attr("class", d => `natural_flowers_${d.subcategory}`)
                        .attr("class", d => `flowers_event_${d.event_name}`)
                        .attr("d", (d, i) => radial_line_creator(flowers_data[i]))
                        .style("fill", (d) => "url(#gradient_" + d.subcategory + ")")
                        .style("opacity", 0)
                        .style("visibility", "hidden");

                    natural_flowers
                        .attr("transform", (d, i) => `translate(${random_over_x_axis_scale(d.year + (d.random_x - 0.5) * 10)},
                    ${random_over_y_axis_scale(d.random_y)}) scale(${flower_area_scale(d.deaths)})`);

                    // COVID19 color
                    d3.selectAll(".flowers_event_COVID19")
                        .style("fill", (d) => "url(#gradient_" + "COVID19" + ")")

                })();

                var natural_big_flower_stem_creator = (function () {
                    var single_flower_data = function () {
                        var data = [];
                        for (var i = 0; i < 30; i++) {
                            var random_number = Math.round(Math.random() * 10);
                            data.push(random_number);
                        }
                        return data;
                    };
                    var all_flowers_data = function () {
                        var data = [];
                        for (var i = 0; i < 1; i++) {
                            var random = single_flower_data();
                            data.push(random);
                        }
                        return data;
                    };
                    flowers_data = all_flowers_data();
                    var angular_domain = [0, single_flower_data().length];
                    var angular_range = [0, 2 * Math.PI];
                    var angular_scale = d3.scaleLinear().domain(angular_domain).range(angular_range);
                    var radial_domain = [0, d3.max(single_flower_data())];

                    var inner_radius = 0.75;
                    var outer_radius = 1;

                    var radial_range = [inner_radius, outer_radius];

                    var radial_scale = d3.scaleLinear().domain(radial_domain).range(radial_range);

                    var radial_line_creator = d3
                        .lineRadial()
                        .angle((d, i) => angular_scale(i))
                        .radius((d) => radial_scale(d))
                        .curve(d3.curveBasisClosed);
                    natural_big_flower_stems_group = svg.append("g")
                        .classed("natural_big_flower_stems_group", true)
                        .attr("transform", (d, i) => `translate(${width*0.5},${height*0.5})`)
                        .lower();

                    natural_big_flower_core = natural_big_flower_stems_group
                        .selectAll("path.big_flower_core")
                        .data([33485710])
                        .enter()
                        .append("path")
                        .classed("big_flower_core", true)
                        .attr("d", (d, i) => radial_line_creator(flowers_data[0]))
                        .style("fill", (d) => "url(#core_gradient)");


                    natural_big_flower_core
                        .attr("transform", (d, i) =>
                            `translate(${0},${0})
                        scale(${core_area_scale(d)})`
                        )

                    var natural_stem_randomizer = function (d, i) {
                        var x = 0;
                        var pos_neg;

                        // if even
                        if (i % 2 == 0) {
                            pos_neg = -1;
                        } else {
                            pos_neg = 1;
                        }

                        var random_num = Math.random();
                        var amount = 0.02;
                        x = random_num * pos_neg * amount;
                        return x;
                    };
                    var natural_stem_data = [];

                    for (var i = 0; i < 5; i++) {
                        var cat = flower_category_dataset[i];
                        var data = [];
                        var x = [];
                        for (var n = 1820; n < 2030; n = n + 20) {
                            x = {
                                category: cat,
                                year: n,
                            };
                            data.push(x);
                        }
                        natural_stem_data.push(data);
                    }
                    var natural_stem_line_generator = d3.line()
                        .x(
                            (d, i) =>
                            big_flower_radial_scale(d.year) *
                            Math.cos(big_flower_angle_slice *
                                (flower_category_serial_scale(d.category) +
                                    natural_stem_randomizer(d, i)) - Math.PI / 2)
                        )
                        .y(
                            (d, i) =>
                            big_flower_radial_scale(d.year) *
                            Math.sin(big_flower_angle_slice *
                                (flower_category_serial_scale(d.category) +
                                    natural_stem_randomizer(d, i)) - Math.PI / 2)
                        )
                        .curve(d3.curveCardinal);


                    // set colors 
                    var natural_big_flower_stems_color = [
                        "#ffb700",
                        "#57fc42",
                        "#42d7fc",
                        "#b1fcf9",
                        "#ff57e9"
                    ];

                    natural_big_flower_stems = natural_big_flower_stems_group
                        .selectAll("path.natural_stem")
                        .data(natural_stem_data)
                        .enter()
                        .append("path")
                        .classed("natural_stem", true)
                        .attr("d", (d) => natural_stem_line_generator(d))
                        .style("stroke", "#9c7b7b") //light: #ad8e8e //dark: #9c7b7b
                        .style("stroke-width", `${1.5 * unit}`)
                        .style("fill", "none")
                        .style("opacity", 1);

                    natural_big_flower_center = natural_big_flower_stems_group
                        .append("circle")
                        .attr("cx", 0)
                        .attr("cy", 0)
                        .attr("r", `${4 * unit}`)
                        .style("fill", "#9c7b7b");


                    natural_big_flower_grid_circles = natural_big_flower_stems_group
                        .selectAll("circle.natural_big_flower_grid_circles")
                        .data([1890, 1980, 2070])
                        .enter()
                        .append("circle")
                        .classed("natural_big_flower_grid_circles", true)
                        .attr("cx", 0)
                        .attr("cy", 0)
                        .attr("r", (d) => big_flower_radial_scale(d))
                        .style("fill", "none")
                        .style("stroke", "grey")
                        .style("stroke-width", 0.5)
                        .style("stroke-dasharray", 5)
                        .style("opacity", 0.4);

                    var annotation_data = [
                        ["Y-1900", 1890],
                        ["Y-2020", 2070]
                    ];

                    var natural_big_flower_annotation_y = natural_big_flower_stems_group
                        .selectAll("text.natural_big_flower_annotation_y")
                        .data(annotation_data)
                        .enter()
                        .append("text")
                        .classed("natural_big_flower_annotation_y", true)
                        .text(d => d[0])
                        .style("fill", "grey")
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("font-size", (d) => `${7 * unit}px`)
                        .attr("x", (d) => big_flower_radial_scale(d[1]));

                    var natural_big_flower_annotation_cat = natural_big_flower_stems_group
                        .selectAll("text.natural_big_flower_annotation_cat")
                        .data(flower_category_dataset)
                        .enter()
                        .append("text")
                        .classed("natural_big_flower_annotation_cat", true)
                        .text((d, i) => d)
                        .style("fill", "#9c7b7b")
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("font-size", (d) => `${8 * unit}px`)
                        .attr("x", (d, i) => big_flower_radial_scale(2115) *
                            Math.cos(big_flower_angle_slice * (i + 1) - Math.PI / 2))
                        .attr("y", (d, i) => big_flower_radial_scale(2105) *
                            Math.sin(big_flower_angle_slice * (i + 1) - Math.PI / 2))


                    natural_big_flower_stems_group
                        .style("opacity", 0)
                        .style("visibility", "hidden");

                })();
                var natural_category_flowers_creator = (function () {
                    var single_flower_data = function () {
                        var data = [];
                        for (var i = 0; i < 30; i++) {
                            var random_number = Math.round(Math.random() * 10);
                            data.push(random_number);
                        }
                        return data;
                    };
                    var all_flowers_data = function () {
                        var data = [];
                        for (var i = 0; i < disasters_deaths_by_category_dataset.length; i++) {
                            var random = single_flower_data();
                            data.push(random);
                        }
                        return data;
                    };
                    flowers_data = all_flowers_data();
                    var angular_domain = [0, single_flower_data().length];
                    var angular_range = [0, 2 * Math.PI];
                    var angular_scale = d3.scaleLinear().domain(angular_domain).range(angular_range);
                    var radial_domain = [0, d3.max(single_flower_data())];

                    var inner_radius = 0.75;
                    var outer_radius = 1;

                    var radial_range = [inner_radius, outer_radius];

                    var radial_scale = d3.scaleLinear().domain(radial_domain).range(radial_range);
                    var radial_line_creator = d3
                        .lineRadial()
                        .angle((d, i) => angular_scale(i))
                        .radius((d) => radial_scale(d))
                        .curve(d3.curveBasisClosed);

                    natural_category_flowers_stem_group = svg.append("g")
                        .classed("natural_category_flowers_stem_group", true)
                        .lower()
                        .style("opacity", 0);
                    natural_category_flowers_cores = natural_category_flowers_stem_group
                        .selectAll("path.natural_flowers")
                        .data(disasters_deaths_by_category_dataset)
                        .enter()
                        .append("path")
                        .attr("d", (d, i) => radial_line_creator(flowers_data[i]))
                        .style("fill", (d) => "url(#core_gradient)");
                    natural_category_flowers_cores
                        .attr("transform", (d, i) =>
                            `translate(${category_x_scale(category_to_serial(d.category))}, ${deaths_y_scale(d.deaths)})
                        scale(${core_area_scale(d.deaths)})`
                        )
                    natural_category_flowers_stems = natural_category_flowers_stem_group
                        .selectAll("path.natural_category_flowers_stem")
                        .data(disasters_deaths_by_category_dataset)
                        .enter()
                        .append("path")
                        .attr("class", "natural_category_flowers_stem")
                        .attr("d", (d) =>
                            `M ${category_x_scale(category_to_serial(d.category))} ${deaths_y_scale(d.deaths)}
                        Q ${category_x_scale(category_to_serial(d.category)+(Math.random()-0.5)*1.3)}
                        ${deaths_y_scale((d.deaths-5000000)/2)}
                        ${category_x_scale(category_to_serial(d.category))} ${deaths_y_scale(-5000000)}
                        L ${category_x_scale(category_to_serial(d.category))} ${deaths_y_scale(-5000000)}
                        `)
                        .style("stroke", "#9c7b7b")
                        .style("stroke-width", `${1.5 * unit}`)
                        .style("fill", "none")
                        .lower();
                    natural_category_flowers_annotation = natural_category_flowers_stem_group
                        .selectAll("text.natural_category_flowers_annotation")
                        .data(disasters_deaths_by_category_dataset)
                        .enter()
                        .append("text")
                        .attr("class", "natural_category_flowers_annotation")
                        .attr("x", d => category_x_scale(category_to_serial(d.category)))
                        .attr("y", d => deaths_y_scale(d.deaths + 5000000))
                        .text(d => d.category)
                        .style("fill", "#9c7b7b") // light: #c7a5a5, dark: #9c7b7b
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("font-size", (d) => `${7.5 * unit}px`);

                    var format_number = d3.format(",");

                    natural_category_flowers_annotation.append("tspan")
                        .attr("x", d => category_x_scale(category_to_serial(d.category)))
                        .attr("y", d => deaths_y_scale(d.deaths + 4500000))
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("fill", "#c7a5a5") // light: #c7a5a5, dark: #9c7b7b
                        .text(d => `${format_number(d.deaths)} Death`)
                        .style("font-size", (d) => `${7.2 * unit}px`);

                    natural_category_flowers_annotation.append("tspan")
                        .attr("x", d => category_x_scale(category_to_serial(d.category)))
                        .attr("y", d => deaths_y_scale(d.deaths + 4100000))
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("fill", "#c7a5a5") // light: #c7a5a5, dark: #9c7b7b
                        .text(d => `${format_number(d.disasters)} Disaster`)
                        .style("font-size", (d) => `${7.2 * unit}px`);


                    natural_category_flowers_stem_group
                        .style("opacity", 0)
                        .style("visibility", "hidden");

                })();
                var natural_subcategory_flowers_creator = (function () {
                    var single_flower_data = function () {
                        var data = [];
                        for (var i = 0; i < 30; i++) {
                            var random_number = Math.round(Math.random() * 10);
                            data.push(random_number);
                        }
                        return data;
                    };
                    var all_flowers_data = function () {
                        var data = [];
                        for (var i = 0; i < disasters_deaths_by_subcategory_dataset.length; i++) {
                            var random = single_flower_data();
                            data.push(random);
                        }
                        return data;
                    };
                    flowers_data = all_flowers_data();
                    var angular_domain = [0, single_flower_data().length];
                    var angular_range = [0, 2 * Math.PI];
                    var angular_scale = d3.scaleLinear().domain(angular_domain).range(angular_range);
                    var radial_domain = [0, d3.max(single_flower_data())];

                    var inner_radius = 0.75;
                    var outer_radius = 1;

                    var radial_range = [inner_radius, outer_radius];

                    var radial_scale = d3.scaleLinear().domain(radial_domain).range(radial_range);
                    var radial_line_creator = d3
                        .lineRadial()
                        .angle((d, i) => angular_scale(i))
                        .radius((d) => radial_scale(d))
                        .curve(d3.curveBasisClosed);
                    natural_subcategory_flowers_stem_group = svg.append("g")
                        .classed("natural_subcategory_flowers_stem_group", true)
                        .lower()
                        .style("opacity", 0);
                    natural_subcategory_flowers_cores = natural_subcategory_flowers_stem_group
                        .selectAll("path")
                        .data(disasters_deaths_by_subcategory_dataset)
                        .enter()
                        .append("path")
                        .attr("d", (d, i) => radial_line_creator(flowers_data[i]))
                        .style("fill", (d) => "url(#core_gradient)");

                    natural_subcategory_flowers_cores
                        .attr("transform", (d, i) =>
                            `translate(${subcategory_x_scale(subcategory_to_serial(d.subcategory))}, ${deaths_y_scale(d.deaths)})
                        scale(${core_area_scale(d.deaths)})`
                        )
                    natural_subcategory_flowers_stems = natural_subcategory_flowers_stem_group
                        .selectAll("path.natural_subcategory_flowers_stem")
                        .data(disasters_deaths_by_subcategory_dataset)
                        .enter()
                        .append("path")
                        .attr("class", "natural_subcategory_flowers_stem")
                        .attr("d", (d) =>
                            `M 
                        ${subcategory_x_scale(subcategory_to_serial(d.subcategory))} 
                        ${deaths_y_scale(d.deaths)}
                        Q
                        ${subcategory_x_scale(subcategory_to_serial(d.subcategory)+(d.subcategory == "Drought"? -0.2:Math.random()-0.5))}
                        ${deaths_y_scale((d.deaths-5000000)/3)}
                        ${category_x_scale(category_to_serial(d.category))}
                        ${deaths_y_scale(-3000000)}
                        L 
                        ${category_x_scale(category_to_serial(d.category))} 
                        ${deaths_y_scale(-5000000)}
                        `)
                        .style("stroke", "#9c7b7b")
                        .style("stroke-width", `${1.5 * unit}`)
                        .style("fill", "none")
                        .lower();
                    natural_subcategory_flowers_annotation = natural_subcategory_flowers_stem_group
                        .selectAll("text.natural_subcategory_flowers_annotation")
                        .data(disasters_deaths_by_subcategory_dataset)
                        .enter()
                        .append("text")
                        .attr("class", "natural_subcategory_flowers_annotation")
                        .attr("class", d => `natural_subcategory_flowers_annotation_${d.subcategory}`)
                        .attr("x", d => subcategory_x_scale(subcategory_to_serial(d.subcategory)))
                        .attr("y", d => deaths_y_scale(d.deaths + (d.deaths < 1000000 ? 3000000 : 5000000)))
                        .text(d => d.type)
                        .style("fill", "#9c7b7b") // light: #c7a5a5, dark: #9c7b7b
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("font-size", (d) => `${7.5 * unit}px`);

                    // format number
                    var format_number = d3.format(",");

                    natural_subcategory_flowers_annotation.append("tspan")
                        .attr("x", d => subcategory_x_scale(subcategory_to_serial(d.subcategory)))
                        .attr("y", d => deaths_y_scale(d.deaths + (d.deaths < 1000000 ? 2500000 : 4500000)))
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("fill", "#c7a5a5") // light: #c7a5a5, dark: #9c7b7b
                        .text(d => `${format_number(d.deaths)} Death`)
                        .style("font-size", (d) => `${7.2 * unit}px`);

                    natural_subcategory_flowers_annotation.append("tspan")
                        .attr("x", d => subcategory_x_scale(subcategory_to_serial(d.subcategory)))
                        .attr("y", d => deaths_y_scale(d.deaths + (d.deaths < 1000000 ? 2100000 : 4100000)))
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("fill", "#c7a5a5") // light: #c7a5a5, dark: #9c7b7b
                        .text(d => `${format_number(d.disasters)} Disaster`)
                        .style("font-size", (d) => `${7.2 * unit}px`);

                    d3.select(".natural_subcategory_flowers_annotation_Volcanic_Activity")
                        .attr("transform", `translate(${0}, ${-60 * unit})`);
                    d3.select(".natural_subcategory_flowers_annotation_Mass_Movement")
                        .attr("transform", `translate(${0 * unit}, ${-50 * unit})`)
                    d3.select(".natural_subcategory_flowers_annotation_Fog")
                        .attr("transform", `translate(${0 * unit}, ${-30 * unit})`)


                    // hide all content
                    natural_subcategory_flowers_stem_group
                        .style("opacity", 0)
                        .style("visibility", "hidden");


                })();
                var continent_flowers_creator = (function () {
                    var single_flower_data = function () {
                        var data = [];
                        for (var i = 0; i < 30; i++) {
                            var random_number = Math.round(Math.random() * 10);
                            data.push(random_number);
                        }
                        return data;
                    };
                    var all_flowers_data = function () {
                        var data = [];
                        for (var i = 0; i < disasters_deaths_by_continent_dataset.length; i++) {
                            var random = single_flower_data();
                            data.push(random);
                        }
                        return data;
                    };
                    flowers_continent_data = all_flowers_data();
                    var angular_domain = [0, single_flower_data().length];
                    var angular_range = [0, 2 * Math.PI];
                    var angular_scale = d3.scaleLinear().domain(angular_domain).range(angular_range);
                    var radial_domain = [0, d3.max(single_flower_data())];

                    var inner_radius = 0.75;
                    var outer_radius = 1;

                    var radial_range = [inner_radius, outer_radius];

                    var radial_scale = d3.scaleLinear().domain(radial_domain).range(radial_range);
                    var radial_line_creator = d3
                        .lineRadial()
                        .angle((d, i) => angular_scale(i))
                        .radius((d) => radial_scale(d))
                        .curve(d3.curveBasisClosed);
                    continent_flowers_stem_group = svg.append("g")
                        .classed("continent_flowers_stem_group", true)
                        .lower()
                        .style("opacity", 0);
                    continent_flowers_cores = continent_flowers_stem_group
                        .selectAll("path.natural_flowers")
                        .data(disasters_deaths_by_continent_dataset)
                        .enter()
                        .append("path")
                        .attr("d", (d, i) => radial_line_creator(flowers_continent_data[i]))
                        .style("fill", (d) => "url(#core_gradient)");
                    continent_flowers_cores
                        .attr("transform", (d, i) =>
                            `translate(${continent_x_scale(continent_to_x(d.continent))},
                        ${continent_y_scale(continent_to_y(d.continent))})
                        scale(${core_area_scale(d.deaths)})`
                        )
                    var natural_stem_randomizer = function (d, i) {
                        var x = 0;
                        var pos_neg;

                        // if even
                        if (i % 2 == 0) {
                            pos_neg = -1;
                        } else {
                            pos_neg = 1;
                        }

                        var random_num = Math.random();
                        var amount = 0.05; // 20 percent of bandwidth
                        x = random_num * pos_neg * amount;
                        return x;
                    };
                    var continent_stem_data = [];

                    // create natural stem data
                    for (var i = 0; i < 5; i++) {
                        var cat = flower_category_dataset[i];
                        var data = [];
                        var x = [];
                        for (var n = 1820; n < 2030; n = n + 25) {
                            x = {
                                category: cat,
                                year: n,
                            };
                            data.push(x);
                        }
                        continent_stem_data.push(data);
                    };
                    var natural_stem_line_generator = d3.line()
                        .x((d, i) =>
                            continent_to_domain_and_range(d.year, d.continent) *
                            Math.cos(continent_flower_angle_slice *
                                (flower_category_serial_scale(d.category) +
                                    natural_stem_randomizer(d, i)) - Math.PI / 2)
                        )
                        .y((d, i) =>
                            continent_to_domain_and_range(d.year, d.continent) *
                            Math.sin(continent_flower_angle_slice *
                                (flower_category_serial_scale(d.category) +
                                    natural_stem_randomizer(d, i)) - Math.PI / 2)
                        )
                        .curve(d3.curveCardinal);


                    var continent_flowers_stems_scale = [2.5, 1.2, 1.2, 1.2, 0.6]

                    continent_flowers_stems = continent_flowers_stem_group
                        .selectAll("g.natural_stem")
                        .data(disasters_deaths_by_continent_dataset) // Asia, Africa, Americas, Europe, Oceania
                        .enter()
                        .append("g")
                        .classed("natural_stem", true)
                        .attr("transform", (d, i) =>
                            `translate(${continent_x_scale(continent_to_x(d.continent))},
                        ${continent_y_scale(continent_to_y(d.continent))})
                        scale(${continent_flowers_stems_scale[i]})`
                        )
                        .each(function (d, i) {
                            d3.select(this)
                                .selectAll("path.natural_stem")
                                .data(continent_stem_data)
                                .enter()
                                .append("path")
                                .classed("natural_stem", true)
                                .attr("d", (d) => natural_stem_line_generator(d))
                                .style("stroke", "#9c7b7b")
                                .style("stroke-width", `${1 * unit}`)
                                .style("fill", "none")
                                .style("opacity", 0.8);

                            d3.select(this)
                                .append("circle")
                                .classed("central_circle", true)
                                .attr("cx", 0)
                                .attr("cy", 0)
                                .attr("r", `${3 * unit}`)
                                .attr("fill", "#9c7b7b")
                                .attr("opacity", 1);
                        })
                        .lower();

                    continent_flowers_cores.lower();
                    continent_flowers_annotation = continent_flowers_stem_group
                        .selectAll("text.continent_flowers_annotation")
                        .data(disasters_deaths_by_continent_dataset)
                        .enter()
                        .append("text")
                        .attr("class", "continent_flowers_annotation")
                        .attr("class", d => `continent_flowers_annotation_${d.continent}`)
                        .attr("x", d => continent_x_scale(continent_to_x(d.continent)))
                        .attr("y", d => continent_y_scale(continent_to_y(d.continent)) +
                            core_area_scale(d.deaths + 8000000))
                        .text(d => d.continent)
                        .style("fill", "#9c7b7b") // light: #c7a5a5, dark: #9c7b7b
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("font-size", (d) => `${7.5 * unit}px`);

                    // format number
                    var format_number = d3.format(",");

                    continent_flowers_annotation.append("tspan")
                        .attr("x", d => continent_x_scale(continent_to_x(d.continent)))
                        .attr("y", d => continent_y_scale(continent_to_y(d.continent)) +
                            core_area_scale(d.deaths + 8000000) + (11 * unit))
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("fill", "#c7a5a5")
                        .text(d => `${format_number(d.deaths)} Death`)
                        .style("font-size", (d) => `${7.2 * unit}px`);

                    continent_flowers_annotation.append("tspan")
                        .attr("x", d => continent_x_scale(continent_to_x(d.continent)))
                        .attr("y", d => continent_y_scale(continent_to_y(d.continent)) +
                            core_area_scale(d.deaths + 8000000) + (21 * unit))
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("fill", "#c7a5a5")
                        .text(d => `${format_number(d.disasters)} Disaster`)
                        .style("font-size", (d) => `${7.2 * unit}px`);

                    d3.select(".continent_flowers_annotation_Asia")
                        .attr("transform", `translate(${0}, ${30 * unit})`);
                    d3.select(".continent_flowers_annotation_Oceania")
                        .attr("transform", `translate(${0}, ${-20 * unit})`);
                    continent_flowers_stem_group
                        .style("opacity", 0)
                        .style("visibility", "hidden");


                })();
                var country_flowers_annotation_creator = (function () {

                    var country_flowers_annotation_data = [{
                            country: "India",
                            disasters: 189,
                            deaths: 9208010,
                            coordinates_a: [78.96288, 20.59368],
                            coordinates_b: [68, -20],
                            coordinates_c: [68, -17]
                        },
                        {
                            country: "China",
                            disasters: 115,
                            deaths: 12508248,
                            coordinates_a: [104.19540, 35.86166],
                            coordinates_b: [170, 70],
                            coordinates_c: [152, 59],
                        },
                        {
                            country: "Bangladesh",
                            disasters: 70,
                            deaths: 2988053,
                            coordinates_a: [90.35633, 23.68499],
                            coordinates_b: [100, -18],
                            coordinates_c: [100, -15]
                        },
                        {
                            country: "Philippines",
                            disasters: 67,
                            deaths: 62481,
                            coordinates_a: [121.774017, 12.879721],
                            coordinates_b: [160, 20],
                            coordinates_c: [149, 18]
                        },
                        {
                            country: "United States",
                            disasters: 41,
                            deaths: 237254,
                            coordinates_a: [-95.712891, 37.090240],
                            coordinates_b: [-70, 45],
                            coordinates_c: [-81, 42]
                        },
                        {
                            country: "Peru",
                            disasters: 28,
                            deaths: 125430,
                            coordinates_a: [-75.015152, -9.189967],
                            coordinates_b: [-90, -20],
                            coordinates_c: [-89, -17]
                        },
                        {
                            country: "Mexico",
                            disasters: 21,
                            deaths: 99726,
                            coordinates_a: [-102.552784, 23.634501],
                            coordinates_b: [-110, 10],
                            coordinates_c: [-110, 13]
                        },
                        {
                            country: "Italy",
                            disasters: 16,
                            deaths: 174639,
                            coordinates_a: [12.567380, 41.871940],
                            coordinates_b: [-20, 80],
                            coordinates_c: [-18, 68]
                        },
                        {
                            country: "Nigeria",
                            disasters: 19,
                            deaths: 25601,
                            coordinates_a: [8.675277, 9.081999],
                            coordinates_b: [-10, -10],
                            coordinates_c: [-10, -7]
                        },

                    ];
                    var format_number = d3.format(",");

                    country_flowers_annotation_group = svg
                        .selectAll("g.country_flowers_annotation_group")
                        .data(country_flowers_annotation_data)
                        .enter()
                        .append("g")
                        .attr("class", "country_flowers_annotation_group")
                        .style("opacity", 0)
                        .style("visibility", "hidden")
                        .each(function (d, i) {
                            d3.select(this)
                                .append("text")
                                .attr("x", (d, i) => projection(d.coordinates_b)[0])
                                .attr("y", (d, i) => projection(d.coordinates_b)[1])
                                .text(d => d.country)
                                .style("fill", "#9c7b7b") // light: #c7a5a5, dark: #9c7b7b
                                .style("text-anchor", "middle")
                                .style("alignment-baseline", "middle")
                                .style("font-size", (d) => `${7.5 * unit}px`);

                            d3.select(this)
                                .append("text")
                                .attr("x", (d, i) => projection(d.coordinates_b)[0])
                                .attr("y", (d, i) => projection(d.coordinates_b)[1] + (12 * unit))
                                .text(d => `${format_number(d.deaths)} Death`)
                                .style("fill", "#c7a5a5") // light: #c7a5a5, dark: #9c7b7b
                                .style("text-anchor", "middle")
                                .style("alignment-baseline", "middle")
                                .style("font-size", (d) => `${7.2 * unit}px`);

                            d3.select(this)
                                .append("text")
                                .attr("x", (d, i) => projection(d.coordinates_b)[0])
                                .attr("y", (d, i) => projection(d.coordinates_b)[1] + (22 * unit))
                                .text(d => `${format_number(d.disasters)} Disaster`)
                                .style("fill", "#c7a5a5") // light: #c7a5a5, dark: #9c7b7b
                                .style("text-anchor", "middle")
                                .style("alignment-baseline", "middle")
                                .style("font-size", (d) => `${7.2 * unit}px`);


                            d3.select(this)
                                .append("path")
                                .attr("d", (d, i) => `M${projection(d.coordinates_a)[0]} ${projection(d.coordinates_a)[1]} 
                                                Q${projection(d.coordinates_a)[0]+10}
                                                ${projection(d.coordinates_a)[1]+20} ${projection(d.coordinates_c)[0]}
                                                ${projection(d.coordinates_c)[1]} 
                                                L${projection(d.coordinates_c)[0]} ${projection(d.coordinates_c)[1]}`)
                                .style("stroke", "#e0d9bc")
                                .style("stroke-width", `${1 * unit}`)
                                .style("stroke-dasharray", "3 3")
                                .style("fill", "none");

                            d3.select(this)
                                .append("circle")
                                .attr("cx", (d, i) => projection(d.coordinates_c)[0])
                                .attr("cy", (d, i) => projection(d.coordinates_c)[1])
                                .attr("r", (2 * unit))
                                .style("stroke", "none")
                                .style("fill", "#bdb593");
                        });


                })();
                var severe_disasters_flowers_creator = (function () {

                    severe_disasters_stems = svg
                        .selectAll("path.severe_disasters_stem")
                        .data(raw_dataset)
                        .enter()
                        .append("path")
                        .attr("class", "severe_disasters_stem")
                        .attr("d", "M0 0 L0 0")
                        .style("stroke", d => flower_subcategory_hex_scale(d.subcategory))
                        .style("stroke-width", `${0.6 * unit}`)
                        .style("fill", "none")
                        .style("opacity", 0.7)
                        .style("visibility", "hidden")
                        .lower();


                    severe_disasters_line_group = svg
                        .append("g")
                        .attr("class", "severe_disasters_line_group")
                        .style("opacity", 1)
                        .style("visibility", "hidden")
                        .each(function (d, i) {
                            d3.select(this)
                                .append("line")
                                .style("stroke", "#9c7b7b")
                                .style("stroke-width", `${0.5 * unit}`)
                                .style("stroke-dasharray", "1 4")
                                .style("fill", "none")
                                .attr("x1", d => year_x_scale(1897))
                                .attr("y1", d => severe_disasters_y_scale(1100000))
                                .attr("x2", d => year_x_scale(1982))
                                .attr("y2", d => severe_disasters_y_scale(1100000));

                            d3.select(this)
                                .append("text")
                                .attr("x", d => year_x_scale(1971))
                                .attr("y", d => severe_disasters_y_scale(1180000))
                                .text("The Big 12 Disasters")
                                .style("fill", "#9c7b7b") // light: #c7a5a5, dark: #9c7b7b
                                .style("text-anchor", "start")
                                .style("alignment-baseline", "middle")
                                .style("font-size", (d) => `${7.5 * unit}px`);
                        }).lower();
                    var severe_disasters_years = [1900, 1940, 1980, 2020];

                    severe_disasters_annotation_year = svg
                        .selectAll("text.severe_disasters_annotation_year")
                        .data(severe_disasters_years)
                        .enter()
                        .append("text")
                        .attr("class", "severe_disasters_annotation_year")
                        .attr("class", d => `main_timeline_annotation_${d}`)
                        .attr("x", d => year_x_scale(d))
                        .attr("y", d => severe_disasters_y_scale(0) + (30 * unit))
                        .text((d, i) => d)
                        .style("fill", "#9c7b7b") // light: #c7a5a5, dark: #9c7b7b
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("font-size", (d) => `${7.5 * unit}px`)
                        .style("visibility", "hidden")
                        .style("opacity", 0);

                    severe_disasters_annotation = svg
                        .selectAll("text.severe_disasters_annotation")
                        .data(raw_dataset.filter(d => d.deaths >= 1000000))
                        .enter()
                        .append("text")
                        .attr("class", "severe_disasters_annotation")
                        .attr("class", (d, i) => `severe_disasters_annotation_${i}`)
                        .attr("x", d => year_x_scale(d.year))
                        .attr("y", d => severe_disasters_y_scale(d.deaths) - (60 * unit))
                        .text((d, i) => `${d.country}`)
                        .style("fill", "#9c7b7b") // light: #c7a5a5, dark: #9c7b7b
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("font-size", (d) => `${7.5 * unit}px`)
                        .style("visibility", "hidden")
                        .style("opacity", 0);
                    var format_number = d3.format(",");
                    severe_disasters_annotation.append("tspan")
                        .attr("class", "severe_disasters_annotation_l1")
                        .attr("x", d => year_x_scale(d.year))
                        .attr("y", d => severe_disasters_y_scale(d.deaths) - (50 * unit))
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("fill", "#c7a5a5") // light: #c7a5a5, dark: #9c7b7b
                        .text(d => `${format_number(d.deaths)} Death`)
                        .style("font-size", (d) => `${7.2 * unit}px`);
                    severe_disasters_annotation.append("tspan")
                        .attr("class", "severe_disasters_annotation_l2")
                        .attr("x", d => year_x_scale(d.year))
                        .attr("y", d => severe_disasters_y_scale(d.deaths) - (10 * unit))
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("fill", "#c7a5a5") // light: #c7a5a5, dark: #9c7b7b
                        .text(d => `${d.type} | Y-${d.year}`)
                        .style("font-size", (d) => `${7.2 * unit}px`);

                    d3.select(".severe_disasters_annotation_1").remove();
                    d3.select(".severe_disasters_annotation_2").remove();
                    d3.select(".severe_disasters_annotation_3").remove();
                    d3.select(".severe_disasters_annotation_4").remove();
                    d3.select(".severe_disasters_annotation_5").remove();
                    d3.select(".severe_disasters_annotation_6").remove();
                    d3.select(".severe_disasters_annotation_8").remove();
                    d3.select(".severe_disasters_annotation_11").remove();


                })();
                var main_timeline_data = [{
                        x: 1.2,
                        y: 2.5
                    },
                    {
                        x: 2,
                        y: 1.5
                    },
                    {
                        x: 4,
                        y: 2.5
                    },
                    {
                        x: 8,
                        y: 2.4
                    },
                    {
                        x: 9,
                        y: 4
                    },
                    {
                        x: 8.5,
                        y: 6.2
                    },
                    {
                        x: 5,
                        y: 6.7
                    },
                    {
                        x: 2.5,
                        y: 6
                    },
                    {
                        x: 1.5,
                        y: 7.5
                    },
                    {
                        x: 2,
                        y: 8.5
                    },
                    {
                        x: 2.4,
                        y: 10
                    },
                    {
                        x: 4,
                        y: 10.8
                    },
                    {
                        x: 6,
                        y: 10.3
                    },
                    {
                        x: 8,
                        y: 10.5
                    },
                    {
                        x: 9.5,
                        y: 10
                    },
                ];
                var main_timeline_creator = (function () {

                    var main_timeline_function = d3.line()
                        .x((d) => main_timeline_x_scale(d.x))
                        .y((d) => main_timeline_y_scale(d.y))
                        .curve(d3.curveCardinal);

                    main_timeline_group = svg.append("g")
                        .classed("main_timeline_group", true)
                        .style("opacity", 0)
                        .style("visibility", "hidden")
                        .lower();

                    main_timeline = main_timeline_group
                        .append("path")
                        .classed("curved_main_timeline", true)
                        .attr("d", main_timeline_function(main_timeline_data))
                        .attr("stroke", "#9c7b7b")
                        .attr("stroke-width", `${1.5 * unit}`)
                        .attr("fill", "none")
                        .style("opacity", 1)
                        .lower();

                    main_timeline_scale = d3
                        .scaleLinear()
                        .domain([1900, 2020]) // decades number
                        .range([0, main_timeline.node().getTotalLength()]);

                    get_point_of_main_timeline = function (d) {
                        var x = main_timeline_scale(d);
                        var line_point = main_timeline.node().getPointAtLength(x);
                        return line_point;
                    };

                    flowers_timeline_scale = d3
                        .scaleLinear()
                        .domain([1, 12])
                        .range([0, main_timeline.node().getTotalLength()]);

                    get_point_of_flowers_timeline = function (d) {
                        var x = flowers_timeline_scale(d);
                        var line_point = main_timeline.node().getPointAtLength(x);
                        return line_point;
                    };

                    var years = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010,
                        2020
                    ];

                    main_timeline_annotation = main_timeline_group
                        .selectAll("text.main_timeline_annotation")
                        .data(years)
                        .enter()
                        .append("text")
                        .attr("class", "main_timeline_annotation")
                        .attr("class", d => `main_timeline_annotation_${d}`)
                        .attr("x", d => get_point_of_main_timeline(d).x)
                        .attr("y", d => get_point_of_main_timeline(d).y + (60 * unit))
                        .text((d, i) => d)
                        .style("fill", "#9c7b7b") // light: #c7a5a5, dark: #9c7b7b
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("font-size", (d) => `${7.5 * unit}px`);
                })();

                var flowers_timeline_creator = (function () {
                    var flowers_timeline_function = d3.line()
                        .x((d) => main_timeline_x_scale(d.x))
                        .y((d) => main_timeline_y_scale(d.y))
                        .curve(d3.curveCardinal);

                    flowers_timeline_group = svg.append("g")
                        .classed("flowers_timeline_group", true)
                        .style("opacity", 0)
                        .style("visibility", "hidden")
                        .lower();

                    flowers_timeline = flowers_timeline_group
                        .append("path")
                        .classed("curved_main_timeline", true)
                        .attr("d", flowers_timeline_function(main_timeline_data))
                        .attr("stroke", "#9c7b7b")
                        .attr("stroke-width", `${1.5 * unit}`)
                        .attr("fill", "none")
                        .style("opacity", 1)
                        .lower();

                    var natural_stem_randomizer = function (d, i) {
                        var x = 0;
                        var pos_neg;

                        // if even
                        if (i % 2 == 0) {
                            pos_neg = -1;
                        } else {
                            pos_neg = 1;
                        }

                        var random_num = Math.random();
                        var amount = 0.05;
                        x = random_num * pos_neg * amount;
                        return x;
                    };

                    var natural_stem_data = [];
                    for (var i = 0; i < 5; i++) {
                        var cat = flower_category_dataset[i];
                        var data = [];
                        var x = [];
                        for (var n = -6; n <
                            13; n = n + 2.5) {
                            x = {
                                category: cat,
                                decade_year: n,
                            };
                            data.push(x);
                        }
                        natural_stem_data.push(data);
                    };

                    // natural stem line generator 
                    var natural_stem_line_generator = d3.line().x((d, i) =>
                            small_flower_radial_scale(d.decade_year) *
                            Math.cos(small_flower_angle_slice *
                                (flower_category_serial_scale(d.category) +
                                    natural_stem_randomizer(d, i)) - Math.PI / 2)
                        )
                        .y((d, i) =>
                            small_flower_radial_scale(d.decade_year) *
                            Math.sin(small_flower_angle_slice *
                                (flower_category_serial_scale(d.category) +
                                    natural_stem_randomizer(d, i)) - Math.PI / 2)
                        )
                        .curve(d3.curveCardinal);
                    flowers_timeline_scale = d3
                        .scaleLinear()
                        .domain([1, 12]) // decades number
                        .range([0, main_timeline.node().getTotalLength()]);
                    get_point_of_flowers_timeline = function (d) {
                        var x = flowers_timeline_scale(d);
                        var line_point = main_timeline.node().getPointAtLength(x);
                        return line_point;
                    };
                    flowers_timeline_stems = flowers_timeline_group
                        .selectAll("g.natural_stem")
                        .data(disasters_deaths_by_decade_dataset)
                        .enter()
                        .append("g")
                        .classed("natural_stem", true)
                        .attr("transform", (d) =>
                            `translate(${get_point_of_flowers_timeline(d.decade).x},
                        ${get_point_of_flowers_timeline(d.decade).y})`
                        )
                        .each(function (d, i) {
                            d3.select(this)
                                .selectAll("path.natural_stem")
                                .data(natural_stem_data)
                                .enter()
                                .append("path")
                                .classed("natural_stem", true)
                                .attr("d", (d) => natural_stem_line_generator(d))
                                .style("stroke", "#9c7b7b")
                                .style("stroke-width", `${1 * unit}`)
                                .style("fill", "none")
                                .style("opacity", 0.8);

                            d3.select(this)
                                .append("circle")
                                .classed("central_circle", true)
                                .attr("cx", 0)
                                .attr("cy", 0)
                                .attr("r", `${3 * unit}`)
                                .attr("fill", "#9c7b7b")
                                .attr("opacity", 1);
                        })
                        .lower();
                    var single_flower_data = function () {
                        var data = [];
                        for (var i = 0; i < 30; i++) {
                            var random_number = Math.round(Math.random() * 10);
                            data.push(random_number);
                        }
                        return data;
                    };
                    var all_flowers_data = function () {
                        var data = [];
                        for (var i = 0; i < disasters_deaths_by_decade_dataset.length; i++) {
                            var random = single_flower_data();
                            data.push(random);
                        }
                        return data;
                    };
                    flowers_timeline_cores_data = all_flowers_data();
                    var angular_domain = [0, single_flower_data().length];
                    var angular_range = [0, 2 * Math.PI];
                    var angular_scale = d3.scaleLinear().domain(angular_domain).range(angular_range);
                    var radial_domain = [0, d3.max(single_flower_data())];
                    var inner_radius = 0.75;
                    var outer_radius = 1;
                    var radial_range = [inner_radius, outer_radius];
                    var radial_scale = d3.scaleLinear().domain(radial_domain).range(radial_range);
                    var radial_line_creator = d3
                        .lineRadial()
                        .angle((d, i) => angular_scale(i))
                        .radius((d) => radial_scale(d))
                        .curve(d3.curveBasisClosed);
                    flowers_timeline_cores_group = svg.append("g")
                        .classed("natural_subcategory_flowers_stem_group", true)
                        .lower()
                        .style("visibility", "hidden")
                        .style("opacity", 0);
                    flowers_timeline_cores = flowers_timeline_cores_group
                        .selectAll("path")
                        .data(disasters_deaths_by_decade_dataset)
                        .enter()
                        .append("path")
                        .attr("d", (d, i) => radial_line_creator(flowers_timeline_cores_data[i]))
                        .style("fill", (d) => "url(#core_gradient)");

                    flowers_timeline_cores
                        .attr("transform", (d, i) =>
                            `translate(${get_point_of_flowers_timeline(d.decade).x},
                        ${get_point_of_flowers_timeline(d.decade).y})
                        scale(${core_area_scale(d.deaths)})`
                        )
                    var decade_text = [
                        "1900 - 1909",
                        "1910 - 1919",
                        "1920 - 1929",
                        "1930 - 1939",
                        "1940 - 1949",
                        "1950 - 1959",
                        "1960 - 1969",
                        "1970 - 1979",
                        "1980 - 1989",
                        "1990 - 1999",
                        "2000 - 2009",
                        "2010 - 2020",
                    ];

                    flowers_timeline_annotation = flowers_timeline_group
                        .selectAll("text.flowers_timeline_annotation")
                        .data(disasters_deaths_by_decade_dataset)
                        .enter()
                        .append("text")
                        .attr("class", "flowers_timeline_annotation")
                        .attr("class", d => `flowers_timeline_annotation_${d.decade}`)
                        .attr("x", d => get_point_of_flowers_timeline(d.decade).x)
                        .attr("y", d => get_point_of_flowers_timeline(d.decade).y + (70 * unit))
                        .text((d, i) => decade_text[i])
                        .style("fill", "#9c7b7b")
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("font-size", (d) => `${7.5 * unit}px`);
                    var format_number = d3.format(",");

                    flowers_timeline_annotation.append("tspan")
                        .attr("x", d => get_point_of_flowers_timeline(d.decade).x)
                        .attr("y", d => get_point_of_flowers_timeline(d.decade).y + (80 * unit))
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("fill", "#c7a5a5")
                        .text(d => `${format_number(d.deaths)} Death`)
                        .style("font-size", (d) => `${7.2 * unit}px`);

                    flowers_timeline_annotation.append("tspan")
                        .attr("x", d => get_point_of_flowers_timeline(d.decade).x)
                        .attr("y", d => get_point_of_flowers_timeline(d.decade).y + (90 * unit))
                        .style("text-anchor", "middle")
                        .style("alignment-baseline", "middle")
                        .style("fill", "#c7a5a5") // light: #c7a5a5, dark: #9c7b7b
                        .text(d => `${format_number(d.disasters)} Disaster`)
                        .style("font-size", (d) => `${7.2 * unit}px`);

                    d3.select(".flowers_timeline_annotation_3")
                        .attr("transform", `translate(${0}, ${10 * unit})`);
                })();
                var world_map = svg.selectAll("path.country") // CSS styles defined above
                    .data(map.features)
                    .enter().append("path")
                    .attr("class", "country")
                    .attr("d", geo_path)
                    .style("fill", "none")
                    .style("stroke", "#9c7b7b")
                    .style("stroke-width", `${0.15 * unit}`)
                    .style("opacity", 0)
                    .style("visibility", "hidden")
                    .lower();
                var random_force_setup = function () {
                    // simulation
                    var simulation = d3.forceSimulation(raw_dataset)
                        .force("x", d3.forceX().strength(0.1)
                            .x((d, i) => random_over_x_axis_scale(d.year + (d.random_x - 0.5) * 10))
                        )
                        .force("y", d3.forceY().strength(0.1)
                            .y((d, i) => random_over_y_axis_scale(d.random_y))
                        )
                        .force("collide", d3.forceCollide().strength(0.5)
                            .radius((d) => flower_area_scale(d.deaths) + (1 * unit))
                            .iterations(1)
                        )
                        .stop();
                    for (var i = 0; i < 300; i++) {
                        simulation.tick();
                    }
                };

                random_force_setup();
                var big_radial_force_setup = function () {
                    var func_x = function (d, i) {
                        var angular_delta = 0;
                        var radial_delta = 0

                        var x = big_flower_radial_scale(d.year + radial_delta) *
                            Math.cos(big_flower_angle_slice * flower_category_serial_scale(d.category) -
                                Math.PI / 2) + angular_delta;
                        return x + (width * 0.5);

                    };
                    var func_y = function (d, i) {
                        var angular_delta = 0;
                        var radial_delta = 0;

                        var y = big_flower_radial_scale(d.year + radial_delta) *
                            Math.sin(big_flower_angle_slice * flower_category_serial_scale(d.category) -
                                Math.PI / 2) + angular_delta;
                        return y + (height * 0.5);
                    };
                    var simulation = d3.forceSimulation(raw_dataset)
                        .force("x", d3.forceX().strength(0.6)
                            .x((d, i) => func_x(d, i))
                        )
                        .force("y", d3.forceY().strength(0.6)
                            .y((d, i) => func_y(d, i))
                        )
                        .force("collide", d3.forceCollide().strength(0.7)
                            .radius((d) => flower_area_scale(d.deaths) + (0.6 * unit))
                            .iterations(1)
                        )
                        .stop();
                    for (var i = 0; i < 300; i++) {
                        simulation.tick();
                    }
                };
                var by_category_force_setup = function () {

                    // position function
                    var func_x_y = function (flower_category) {

                        var selected_data = disasters_deaths_by_category_dataset.filter(d => d
                            .category ==
                            flower_category);
                        var x = selected_data[0].category;
                        var y = selected_data[0].deaths;
                        return [category_x_scale(category_to_serial(x)), deaths_y_scale(y)];
                    };
                    var simulation = d3.forceSimulation(raw_dataset)
                        .force("x", d3.forceX().strength(0.1)
                            .x((d, i) => func_x_y(d.category)[0])
                        )
                        .force("y", d3.forceY().strength(0.1)
                            .y((d, i) => func_x_y(d.category)[1])
                        )
                        .force("collide", d3.forceCollide().strength(0.7)
                            .radius((d) => flower_area_scale(d.deaths) + (0.6 * unit))
                            .iterations(1)
                        )
                        .stop();
                    for (var i = 0; i < 300; i++) {
                        simulation.tick();
                    }
                };
                var by_subcategory_force_setup = function () {
                    var func_x_y = function (flower_subcategory) {

                        var selected_data = disasters_deaths_by_subcategory_dataset
                            .filter(d => d.subcategory == flower_subcategory);
                        var x = selected_data[0].subcategory;
                        var y = selected_data[0].deaths;
                        return [subcategory_x_scale(subcategory_to_serial(x)), deaths_y_scale(y)];
                    };
                    var simulation = d3.forceSimulation(raw_dataset)
                        .force("x", d3.forceX().strength(0.1)
                            .x((d, i) => func_x_y(d.subcategory)[0])
                        )
                        .force("y", d3.forceY().strength(0.1)
                            .y((d, i) => func_x_y(d.subcategory)[1])
                        )
                        .force("collide", d3.forceCollide().strength(0.7)
                            .radius((d) => flower_area_scale(d.deaths) + (0.6 * unit))
                            .iterations(1)
                        )
                        .stop();
                    for (var i = 0; i < 300; i++) {
                        simulation.tick();
                    }
                };
                var main_timeline_force_setup = function () {

                    var cluster_by_decade_function = function () {
                        for (var i = 0; i < raw_dataset.length; i++) {
                            raw_dataset[i].cluster = raw_dataset[i].decade
                        };
                    }();

                    // simulation
                    var simulation = d3.forceSimulation(raw_dataset)
                        .force("x", d3.forceX().strength(0.6)
                            .x((d, i) => get_point_of_main_timeline(d.year).x)
                        )
                        .force("y", d3.forceY().strength(0.6)
                            .y((d, i) => get_point_of_main_timeline(d.year).y)
                        )
                        .force("collide", forceClusterCollision().strength(0.7)
                            .radius((d) => flower_area_scale(d.deaths) + (0.6 * unit))
                            .clusterPadding((6 * unit))
                        )
                        .stop();
                    for (var i = 0; i < 300; i++) {
                        simulation.tick();
                    }
                };
                var flowers_timeline_force_setup = function () {
                    var func_x = function (d, i) {
                        var angular_delta = 0;
                        var radial_delta = 0

                        var x = small_flower_radial_scale(d.decade_year + radial_delta) *
                            Math.cos(small_flower_angle_slice * flower_category_serial_scale(d
                                    .category) -
                                Math.PI / 2) + angular_delta;
                        return x;
                    };
                    var func_y = function (d, i) {
                        var angular_delta = 0;
                        var radial_delta = 0;

                        var y = small_flower_radial_scale(d.decade_year + radial_delta) *
                            Math.sin(small_flower_angle_slice * flower_category_serial_scale(d
                                    .category) -
                                Math.PI / 2) + angular_delta;
                        return y;
                    };
                    get_point_of_flowers_timeline = function (d) {
                        var x = flowers_timeline_scale(d.decade);
                        var line_point = flowers_timeline.node().getPointAtLength(x);
                        return line_point;
                    };
                    var simulation = d3.forceSimulation(raw_dataset)
                        .force("x", d3.forceX().strength(0.6)
                            .x((d, i) => get_point_of_flowers_timeline(d).x + func_x(d, i))
                        )
                        .force("y", d3.forceY().strength(0.6)
                            .y((d, i) => get_point_of_flowers_timeline(d).y + func_y(d, i))
                        )
                        .force("collide", d3.forceCollide().strength(0.7)
                            .radius((d) => flower_area_scale(d.deaths) + (0.15 * unit))
                            .iterations(1)
                        )
                        .stop();
                    for (var i = 0; i < 300; i++) {
                        simulation.tick();
                    }
                };
                var by_continent_force_setup = function () {
                    var func_x_y = function (flower_continent) {

                        var selected_data = disasters_deaths_by_continent_dataset.filter(d => d
                            .continent ==
                            flower_continent);
                        var x = selected_data[0].continent;
                        var y = selected_data[0].continent;
                        return [continent_x_scale(continent_to_x(x)), continent_y_scale(continent_to_y(
                            y))];
                    };
                    var func_x = function (d, i) {
                        var angular_delta = 0;
                        var radial_delta = 0

                        var x = continent_to_domain_and_range(d.year, d.continent) *
                            Math.cos(continent_flower_angle_slice * flower_category_serial_scale(d
                                    .category) -
                                Math.PI / 2) + angular_delta;
                        return x;
                    };
                    var func_y = function (d, i) {
                        var angular_delta = 0;
                        var radial_delta = 0;

                        var y = continent_to_domain_and_range(d.year, d.continent) *
                            Math.sin(continent_flower_angle_slice * flower_category_serial_scale(d
                                    .category) -
                                Math.PI / 2) + angular_delta;
                        return y;
                    };
                    var simulation = d3.forceSimulation(raw_dataset)
                        .force("x", d3.forceX().strength(0.6)
                            .x((d, i) => continent_x_scale(continent_to_x(d.continent)) + func_x(d, i))
                        )
                        .force("y", d3.forceY().strength(0.6)
                            .y((d, i) => continent_y_scale(continent_to_y(d.continent)) + func_y(d, i))
                        )
                        .force("collide", d3.forceCollide().strength(0.7)
                            .radius((d) => flower_area_scale(d.deaths) + (0.2 * unit))
                            .iterations(1)
                        )
                        .stop();
                    for (var i = 0; i < 300; i++) {
                        simulation.tick();
                    }
                };
                var by_country_force_setup = function () {

                    var cluster_by_country_function = function () {
                        for (var i = 0; i < raw_dataset.length; i++) {
                            raw_dataset[i].cluster = raw_dataset[i].country
                        };
                    }();
                    var simulation = d3.forceSimulation(raw_dataset)
                        .force("x", d3.forceX().strength(0.6)
                            .x((d, i) => projection(d.coordinates)[0])
                        )
                        .force("y", d3.forceY().strength(0.6)
                            .y((d, i) => projection(d.coordinates)[1])
                        )
                        .force("collide", forceClusterCollision().strength(0.7)
                            .radius((d) => flower_area_scale(d.deaths) + (0.01 * unit))
                            .clusterPadding((6 * unit))
                        )
                        .stop();
                    for (var i = 0; i < 300; i++) {
                        simulation.tick();
                    }
                };
                var severe_disasters_force_setup = function () {

                    // simulation 
                    var simulation = d3.forceSimulation(raw_dataset)
                        .force("x", d3.forceX().strength(1)
                            .x((d, i) => year_x_scale(d.year + (Math.random() - 0.5) * 10))
                        )
                        .force("y", d3.forceY().strength(0.5)
                            .y((d, i) => d.deaths >= 1000 ? severe_disasters_y_scale(d.deaths + 220000) :
                                severe_disasters_y_scale(d.deaths + (Math.random() - 0.4) * 300000))
                        )
                        .force("collide", d3.forceCollide().strength(0.3)
                            .radius((d) => (d.deaths >= 1500) ? flower_area_scale(d.deaths) + (2) : 0)
                            .iterations(1)
                        )
                        .stop();
                    for (var i = 0; i < 300; i++) {
                        simulation.tick();
                    }
                };
                var tooltip_circle = svg.append("circle")
                    .classed("tooltip-circle", true)
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", 0)
                    .style("fill", "none")
                    .style("stroke", "white")
                    .style("stroke-width", unit * 0.8)
                    .style("stroke-dasharray", "1 1")
                    .style("opacity", 0);
                var tooltip_wrapper = svg.append("g")
                    .attr("class", "tooltip-wrapper")
                    .attr("transform", "translate(" + 0 + "," + 0 + ")")
                    .style("font-size", `${7.6 * unit}px`)
                    .style("opacity", 1);
                var tooltip_background = tooltip_wrapper.append("rect")
                    .attr("class", "tooltip-background")
                    .attr("x", 0)
                    .attr("y", -22 * unit)
                    .attr("rx", 2 * unit)
                    .attr("ry", 2 * unit)
                    .attr("width", 0)
                    .attr("height", 69 * unit)
                    .style("opacity", 0.8);
                var tooltip_deaths_year = tooltip_wrapper.append("text")
                    .attr("class", "tooltip-deaths-year")
                    .attr("id", "tooltip_deaths_year")
                    .attr("y", -3.9 * unit)
                    .style("fill", "#f6b332")
                    .style("font-size", `${8.8 * unit}px`)
                    .text("");
                var tooltip_country_continent = tooltip_wrapper.append("text")
                    .attr("class", "tooltip-country-continent")
                    .attr("id", "tooltip_country_continent")
                    .attr("y", 11.7 * unit)
                    .style("fill", "white")
                    .text("");
                var tooltip_category_type = tooltip_wrapper.append("text")
                    .attr("class", "tooltip-category-type")
                    .attr("id", "tooltip_category_type")
                    .attr("y", 11.7 * unit * 2)
                    .style("fill", "white")
                    .text("");
                var tooltip_event = tooltip_wrapper.append("text")
                    .attr("class", "tooltip-event")
                    .attr("id", "tooltip_event")
                    .attr("y", 11.7 * unit * 3.3)
                    .style("fill", "#c4c4c4")
                    .text("");
                natural_flowers
                    .on("mouseover", function (d) {
                        var format_number = d3.format(",");
                        var separator;
                        if (d.subtype == 0) {
                            separator = "";
                        } else if (d.event_name == 0) {
                            separator = "";
                        } else {
                            separator = " - ";
                        }

                        // color the text
                        tooltip_deaths_year.style("fill",
                            `${flower_subcategory_txt_rgba_scale(d.subcategory)},1)`)

                        tooltip_deaths_year.text(format_number(d.deaths) + " Deaths | Y-" + d.year);
                        tooltip_country_continent.text(d.country + " | " + d.continent);
                        tooltip_category_type.text(d.type + " | " + d.category);
                        tooltip_event.text(d.type == d.subtype ? "" : d.subtype + separator + d.event_name);

                        var maxSize = Math.max(
                            document.getElementById("tooltip_deaths_year").getComputedTextLength(),
                            document.getElementById("tooltip_country_continent")
                            .getComputedTextLength(),
                            document.getElementById("tooltip_category_type").getComputedTextLength(),
                            document.getElementById("tooltip_event").getComputedTextLength(),
                        );

                        tooltip_background
                            .transition().duration(100)
                            .attr("x", -0.5 * maxSize * 1.2)
                            .attr("width", maxSize * 1.2)

                        if (d.x > 0.8 * w && d.y > 0.65 * h) {
                            tooltip_wrapper
                                .transition().duration(100)
                                .attr("transform", "translate(" + (d.x - (maxSize * 0.5)) + "," + (d.y - (
                                        47 *
                                        unit)) +
                                    ")")
                                .style("opacity", 1);
                        } else if (d.x < 0.1 * w && d.y > 0.65 * h) {
                            tooltip_wrapper
                                .transition().duration(100)
                                .attr("transform", "translate(" + (d.x + (maxSize * 0.5)) + "," + (d.y - (
                                        47 *
                                        unit)) +
                                    ")")
                                .style("opacity", 1);
                        } else if (d.x > 0.8 * w) {
                            tooltip_wrapper
                                .transition().duration(100)
                                .attr("transform", "translate(" + (d.x - (maxSize * 0.5)) + "," + (d.y + (
                                        32 *
                                        unit)) +
                                    ")")
                                .style("opacity", 1);
                        } else if (d.x < 0.1 * w) {
                            tooltip_wrapper
                                .transition().duration(100)
                                .attr("transform", "translate(" + (d.x + (maxSize * 0.5)) + "," + (d.y + (
                                        32 *
                                        unit)) +
                                    ")")
                                .style("opacity", 1);
                        } else if (d.y > 0.65 * h) {
                            tooltip_wrapper
                                .transition().duration(100)
                                .attr("transform", "translate(" + (d.x) + "," + (d.y - (47 * unit)) + ")")
                                .style("opacity", 1);
                        } else {
                            tooltip_wrapper
                                .transition().duration(100)
                                .attr("transform", "translate(" + (d.x) + "," + (d.y + (32 * unit)) + ")")
                                .style("opacity", 1);
                        }

                        // show tooltip-circle
                        tooltip_circle
                            .attr("transform", "translate(" + (d.x) + "," + (d.y) + ")");

                        tooltip_circle
                            .transition().duration(100)
                            .attr("r", `${flower_area_scale(d.deaths) + 1*unit}`)
                            .style("opacity", 1);
                    })

                    .on("mouseout", function (d) {
                        //Hide the tooltip
                        tooltip_wrapper
                            .transition().duration(100)
                            .style("opacity", 0);

                        // hide tooltip-circle
                        tooltip_circle
                            .transition().duration(100)
                            .attr("r", 0)
                            .style("opacity", 0);

                    });

                function forceClusterCollision() {
                    let nodes
                    let radii
                    let strength = 1
                    let iterations = 1
                    let clusterPadding = 0 //addition

                    function radius(d) {
                        return d.r
                    }

                    function x(d) {
                        return d.x + d.vx
                    }

                    function y(d) {
                        return d.y + d.vy
                    }

                    function constant(x) {
                        return function () {
                            return x
                        }
                    }

                    function jiggle() {
                        return 1e-6
                    }

                    function force() {
                        let i
                        let n = nodes.length
                        let tree
                        let node
                        let xi
                        let yi
                        let ri
                        let ri2

                        for (let k = 0; k < iterations; ++k) {
                            tree = d3.quadtree(nodes, x, y).visitAfter(prepare)
                            for (i = 0; i < n; ++i) {
                                node = nodes[i]
                                ri = radii[node.index]
                                ri2 = ri * ri
                                xi = node.x + node.vx
                                yi = node.y + node.vy
                                tree.visit(apply)
                            } //for i
                        } //for k

                        function apply(quad, x0, y0, x1, y1) {
                            let data = quad.data
                            let rj = quad.r
                            let r = ri + rj + clusterPadding //change
                            if (data) {
                                if (data.index > node.index) {
                                    let x = xi - data.x - data.vx
                                    let y = yi - data.y - data.vy
                                    let l = x * x + y * y
                                    r = ri + rj + (node.cluster !== quad.data.cluster ? clusterPadding :
                                        0) //addition

                                    if (l < r * r) {
                                        if (x === 0) x = jiggle(), l += x * x
                                        if (y === 0) y = jiggle(), l += y * y
                                        l = (r - (l = Math.sqrt(l))) / l * strength
                                        node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj))
                                        node.vy += (y *= l) * r
                                        data.vx -= x * (r = 1 - r)
                                        data.vy -= y * r
                                    } //if
                                } //if
                                return
                            } //if
                            return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r
                        } //apply
                    } //force

                    function prepare(quad) {
                        if (quad.data) return quad.r = radii[quad.data.index];
                        for (let i = quad.r = 0; i < 4; ++i) {
                            if (quad[i] && quad[i].r > quad.r) {
                                quad.r = quad[i].r
                            } //if
                        }
                    }

                    function initialize() {
                        if (!nodes) return;
                        let i, n = nodes.length,
                            node
                        radii = new Array(n)
                        for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes)
                    }

                    force.initialize = function (_) {
                        nodes = _
                        initialize()
                        return force
                    }

                    force.iterations = function (_) {
                        return arguments.length ? (iterations = +_, force) : iterations
                    }
                    force.strength = function (_) {
                        return arguments.length ? (strength = +_, force) : strength
                    }

                    force.radius = function (_) {
                        return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_),
                            force) : radius
                    }
                    force.clusterPadding = function (_) {
                        return arguments.length ? (clusterPadding = +_, force) : clusterPadding
                    }

                    return force
                }
                var scene_00 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("id", "image_size")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/01_POMPEII_Intro.jpg");
                var scene_01 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/02_POMPEII_Mother.jpg");
                var scene_02 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/03_POMPEII_City.jpg");
                var scene_03 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/04_POMPEII_City2.jpg");
                var scene_04 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/05_POMPEII_Earthquake.jpg");
                var scene_05 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/06_POMPEII_Return.jpg");
                var scene_06 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/07_POMPEII_Angry.jpg");
                var scene_07 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/08_POMPEII_Volc_1.jpg");
                var scene_08 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/09_POMPEII_Volc_2.jpg");
                var scene_09 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/10_POMPEII_Volc_3.jpg");
                var scene_10 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/11_POMPEII_Scared-2.jpg");
                var scene_11 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/12_POMPEII_Volc_4.jpg");
                var scene_12 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/13_POMPEII_Removal.jpg");
                var scene_13 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/14_POMPEII_Discovery.jpg");
                var scene_14 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/15_POMPEII_People.jpg");
                var scene_15 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/16_POMPEII_Flower.jpg");
                var scene_16 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/17_POMPEII_Deaths_1.jpg");
                var scene_17 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/18_POMPEII_Deaths_2-1.jpg");
                var scene_18 = svg
                    .append("image")
                    .attr("class", "story_illustration")
                    .attr("href", "https://www.alhadaqa.com/wp-content/uploads/2020/11/19_POMPEII_Man.jpg");
                d3.selectAll(".story_illustration")
                    .style("width", "100%")
                    .style("height", "90%")
                    .style("opacity", 0)
                    .attr("transform", `translate(${-margin.left}, ${-margin.top + 30})`)
                    .lower();

                scene_00.style("opacity", 1);
                var imageBBox = document.querySelector('#image_size').getBBox();
                var visible_scenes = function () {
                    scene_00.style("visibility", "hidden");
                    scene_01.style("visibility", "hidden");
                    scene_02.style("visibility", "hidden");
                    scene_03.style("visibility", "hidden");
                    scene_04.style("visibility", "hidden");
                    scene_05.style("visibility", "hidden");
                    scene_06.style("visibility", "hidden");
                    scene_07.style("visibility", "hidden");
                    scene_08.style("visibility", "hidden");
                    scene_09.style("visibility", "hidden");
                    scene_10.style("visibility", "hidden");
                    scene_11.style("visibility", "hidden");
                    scene_12.style("visibility", "hidden");
                    scene_13.style("visibility", "hidden");
                    scene_14.style("visibility", "hidden");
                    scene_15.style("visibility", "hidden");
                    scene_16.style("visibility", "hidden");
                    scene_17.style("visibility", "hidden");
                    scene_18.style("visibility", "hidden");

                };

                visible_scenes()
                var screen_00 = function () {
                    visible_scenes();

                    scene_00
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_01
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_01 = function () {
                    visible_scenes();
                    scene_00
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                    scene_01
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);
                    scene_02
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_02 = function () {
                    visible_scenes();

                    scene_01
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_02
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_03
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_03 = function () {
                    visible_scenes();

                    scene_02
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_03
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_04
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_04 = function () {
                    visible_scenes();

                    scene_03
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_04
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_05
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_05 = function () {
                    visible_scenes();

                    scene_04
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_05
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_06
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_06 = function () {
                    visible_scenes();

                    scene_05
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_06
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_07
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_07 = function () {
                    visible_scenes();

                    scene_06
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_07
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_08
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_08 = function () {
                    visible_scenes();

                    scene_07
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_08
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_09
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_09 = function () {
                    visible_scenes();

                    scene_08
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_09
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_10
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_10 = function () {
                    visible_scenes();

                    scene_09
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_10
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_11
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_11 = function () {
                    visible_scenes();

                    scene_10
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_11
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_12
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_12 = function () {
                    visible_scenes();

                    scene_11
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_12
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_13
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_13 = function () {
                    visible_scenes();

                    scene_12
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_13
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_14
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_14 = function () {
                    visible_scenes();

                    scene_13
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_14
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_15
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                };
                var screen_15 = function () {
                    visible_scenes();

                    scene_14
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_15
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_16
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                };
                var screen_16 = function () {
                    visible_scenes();

                    scene_15
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_16
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                    scene_17
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                    tooltip_wrapper.style("visibility", "hidden")
                    natural_flowers
                        .style("visibility", "hidden")

                };
                var screen_17 = function () {
                    visible_scenes();

                    scene_16
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);

                    scene_17
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);
                    tooltip_wrapper
                        .transition()
                        .duration(1000)
                        .style("visibility", "hidden")
                        .style("opacity", 0);
                    tooltip_circle
                        .transition()
                        .duration(1000)
                        .style("visibility", "hidden")
                        .style("opacity", 0);
                    natural_flowers
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(d => Math.random() * 1000)
                        .delay((d, i) => 0 + (Math.random() * 1000))
                        .style("opacity", 0)
                        .attr("transform", (d, i) =>
                            `translate(${d.x + ((Math.random()-0.5)*10)},${d.y + ((Math.random()-0.5)*10)})
                        scale(${flower_area_scale(d.deaths-(d.deaths*0.5))})`);

                    natural_big_flower_stems_group
                        .style("visibility", "hidden")
                };
                var screen_18 = function () {
                    visible_scenes();

                    scene_17
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                    tooltip_wrapper
                        .transition()
                        .duration(1000)
                        .delay(3000)
                        .style("visibility", "visible")
                        .style("opacity", 1);
                    tooltip_circle
                        .transition()
                        .duration(1000)
                        .delay(3000)
                        .style("visibility", "visible")
                        .style("opacity", 1);
                    random_force_setup();
                    natural_flowers
                        .style("visibility", "visible")
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(d => Math.random() * 1000)
                        .delay((d, i) => 2000 + (Math.random() * 2000))
                        .style("opacity", 1)
                        .attr("transform", (d, i) => `translate(${d.x},${d.y})
                        scale(${flower_area_scale(d.deaths)})`);
                    natural_big_flower_stems_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden")
                };
                var screen_19 = function () {
                    big_radial_force_setup();
                    natural_flowers
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(d => Math.random() * 2000)
                        .delay((d, i) => 2000 + (Math.random() * 2000))
                        .style("opacity", 1)
                        .attr("transform", (d, i) => `translate(${d.x},${d.y})
                        scale(${flower_area_scale(d.deaths)})`);
                    natural_big_flower_stems_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1);
                    natural_category_flowers_stem_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");
                    tooltip_wrapper
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");

                    tooltip_circle
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");

                };
                var screen_20 = function () {

                    // move the flowers
                    by_category_force_setup();
                    natural_flowers
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(d => Math.random() * 2000)
                        .delay((d, i) => 2000 + (Math.random() * 2000))
                        .style("opacity", 1)
                        .attr("transform", (d, i) => `translate(${d.x},${d.y})
                        scale(${flower_area_scale(d.deaths)})`);
                    natural_big_flower_stems_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");
                    natural_category_flowers_stem_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1);
                    natural_subcategory_flowers_stem_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");
                    tooltip_wrapper
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");

                    tooltip_circle
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");
                };
                var screen_21 = function () {
                    by_subcategory_force_setup();

                    natural_flowers
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(d => Math.random() * 2000)
                        .delay((d, i) => 2000 + (Math.random() * 2000))
                        .style("opacity", 1)
                        .attr("transform", (d, i) => `translate(${d.x},${d.y})
                        scale(${flower_area_scale(d.deaths)})`);
                    natural_category_flowers_stem_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");
                    natural_subcategory_flowers_stem_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1)


                    // show curved_main_timeline_group
                    main_timeline_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");
                    tooltip_wrapper
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");

                    tooltip_circle
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");
                };
                var screen_22 = function () {
                    main_timeline_force_setup();

                    natural_flowers
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(d => Math.random() * 2000)
                        .delay((d, i) => 2000 + (Math.random() * 2000))
                        .style("opacity", 1)
                        .attr("transform", (d, i) => `translate(${d.x},${d.y})
                        scale(${flower_area_scale(d.deaths)})`);
                    natural_subcategory_flowers_stem_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");
                    main_timeline_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1);

                    flowers_timeline_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    flowers_timeline_cores_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");
                    tooltip_wrapper
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");

                    tooltip_circle
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");
                };
                var screen_23 = function () {

                    // move the flowers
                    flowers_timeline_force_setup();

                    natural_flowers
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(d => Math.random() * 2000)
                        .delay((d, i) => 2000 + (Math.random() * 2000))
                        .style("opacity", 1)
                        .attr("transform", (d, i) => `translate(${d.x},${d.y})
                        scale(${flower_area_scale(d.deaths)})`);
                    main_timeline_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    flowers_timeline_group
                        .style("visibility", "visible")
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 1);

                    flowers_timeline_cores_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1);

                    continent_flowers_stem_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    tooltip_wrapper
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");

                    tooltip_circle
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");

                };
                var screen_24 = function () {

                    by_continent_force_setup();

                    natural_flowers
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(d => Math.random() * 2000)
                        .delay((d, i) => 2000 + (Math.random() * 2000))
                        .style("opacity", 1)
                        .attr("transform", (d, i) => `translate(${d.x},${d.y})
                        scale(${flower_area_scale(d.deaths)})`);

                    flowers_timeline_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    flowers_timeline_cores_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    continent_flowers_stem_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1);

                    world_map
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    country_flowers_annotation_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    tooltip_wrapper
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");

                    tooltip_circle
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");
                };
                var screen_25 = function () {

                    by_country_force_setup();

                    natural_flowers
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(d => Math.random() * 2000)
                        .delay((d, i) => 2000 + (Math.random() * 2000))
                        .style("opacity", 1)
                        .attr("transform", (d, i) => `translate(${d.x},${d.y})
                        scale(${flower_area_scale(d.deaths)})`);


                    continent_flowers_stem_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    world_map
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 0.4);

                    country_flowers_annotation_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1);

                    severe_disasters_stems
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");


                    severe_disasters_annotation_year
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    severe_disasters_annotation
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    severe_disasters_annotation.selectAll("tspan")
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    severe_disasters_line_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");
                    tooltip_wrapper
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");

                    tooltip_circle
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");
                };
                var screen_26 = function () {

                    severe_disasters_force_setup();

                    natural_flowers
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(d => Math.random() * 2000)
                        .delay((d, i) => 2000 + (Math.random() * 2000))
                        .style("visibility", "visible")
                        .style("opacity", 1)
                        .attr("transform", (d, i) => `translate(${d.x},${d.y})
                        scale(${flower_area_scale(d.deaths)})`);

                    severe_disasters_stems
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(200)
                        .attr("d", (d, i) =>
                            `M${d.x} ${severe_disasters_y_scale(0)} Q${d.x-((Math.random())*20)}
                        ${severe_disasters_y_scale(0)} ${d.x}
                                    ${severe_disasters_y_scale(0)} L${d.x-20} ${severe_disasters_y_scale(0)}`
                        )
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .attr("d", (d, i) =>
                            `M${d.x} ${d.y} Q${d.x-((Math.random())*20)} ${severe_disasters_y_scale(d.deaths/3)} ${d.x}
                                        ${severe_disasters_y_scale(0)} L${d.x-20} ${severe_disasters_y_scale(0)}`
                        )
                        .style("visibility", "visible")
                        .style("opacity", 0.7);


                    severe_disasters_annotation_year
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1);

                    severe_disasters_annotation
                        .attr("x", (d, i) => d.x)
                        .attr("y", (d, i) => d.y - (60 * unit))
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1);

                    severe_disasters_annotation.selectAll("tspan.severe_disasters_annotation_l1")
                        .attr("x", (d, i) => d.x)
                        .attr("y", (d, i) => d.y - (50 * unit))
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1);
                    severe_disasters_annotation.selectAll("tspan.severe_disasters_annotation_l2")
                        .attr("x", (d, i) => d.x)
                        .attr("y", (d, i) => d.y - (40 * unit))
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1);

                    severe_disasters_line_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("visibility", "visible")
                        .style("opacity", 1);


                    world_map
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    country_flowers_annotation_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .delay(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    tooltip_wrapper
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");

                    tooltip_circle
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .style("visibility", "visible");

                    scene_18
                        .style("visibility", "visible")
                        .transition()
                        .duration(1000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 0);
                };
                var screen_27 = function () {
                    visible_scenes();

                    natural_flowers
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    severe_disasters_stems
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    severe_disasters_annotation
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    severe_disasters_annotation_year
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    severe_disasters_line_group
                        .transition()
                        .ease(d3.easeCubicInOut)
                        .duration(2000)
                        .style("opacity", 0)
                        .transition()
                        .duration(100)
                        .style("visibility", "hidden");

                    scene_18
                        .style("visibility", "visible")
                        .transition()
                        .duration(2000)
                        .ease(d3.easeCubicInOut)
                        .style("opacity", 1);

                };

                function scroll(n, offset, func1, func2) {
                    return new Waypoint({
                        element: document.getElementById(n),
                        handler: function (direction) {
                            direction == "down" ? func1() : func2();
                        },
                        offset: offset,
                    });
                }
                new scroll("div_01", "80%", screen_01, screen_00);
                new scroll("div_02", "80%", screen_02, screen_01);
                new scroll("div_03", "80%", screen_03, screen_02);
                new scroll("div_04", "80%", screen_04, screen_03);
                new scroll("div_05", "80%", screen_05, screen_04);
                new scroll("div_06", "80%", screen_06, screen_05);
                new scroll("div_07", "80%", screen_07, screen_06);
                new scroll("div_08", "80%", screen_08, screen_07);
                new scroll("div_09", "80%", screen_09, screen_08);
                new scroll("div_10", "80%", screen_10, screen_09);
                new scroll("div_11", "80%", screen_11, screen_10);
                new scroll("div_12", "80%", screen_12, screen_11);
                new scroll("div_13", "80%", screen_13, screen_12);
                new scroll("div_14", "80%", screen_14, screen_13);
                new scroll("div_15", "80%", screen_15, screen_14);
                new scroll("div_16", "80%", screen_16, screen_15);
                new scroll("div_17", "80%", screen_17, screen_16);
                new scroll("div_18", "80%", screen_18, screen_17);
                new scroll("div_19", "80%", screen_19, screen_18);
                new scroll("div_20", "80%", screen_20, screen_19);
                new scroll("div_21", "80%", screen_21, screen_20);
                new scroll("div_22", "80%", screen_22, screen_21);
                new scroll("div_23", "80%", screen_23, screen_22);
                new scroll("div_24", "80%", screen_24, screen_23);
                new scroll("div_25", "80%", screen_25, screen_24);
                new scroll("div_26", "80%", screen_26, screen_25);
                new scroll("div_27", "80%", screen_27, screen_26);
                screen_00();
            }