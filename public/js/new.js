let map;
let directionsDisplay = null;
let directionsService;
let polylinePath;

let nodes = [];
let prevNodes = [];
let markers = [];
let durations = [];

let fitness = [];
let populations = [];
// Инициализация Гугл Карты
function initializeMap() {
// Настройки карты
    let opts = {
        center: new google.maps.LatLng(53.9, 27.5667),
        zoom: 7.5,
        streetViewControl: true,
        mapTypeControl: true,
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), opts);

    // Создание меток
    map.addListener('click', function(event) {
        // Добавить пункт назначения (max 10)
        if (nodes.length >= 10) {
            alert('Максимальное количество точек добавлено');
            return;
        }

        // Если показаны направления, удалить их
        clearDirections();

        // Добавить узел на карту
        marker = new google.maps.Marker({position: event.latLng, map: map});
        markers.push(marker);

        // Сохранить широту и долготу узла
        nodes.push(event.latLng);

        // Обновить количество пунктов назначения
        $('#destinations-count').html(nodes.length);
    });

    // Добавить кнопку «Мое местоположение»
    let myLocationDiv = document.createElement('div');
    new getMyLocation(myLocationDiv, map);

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(myLocationDiv);



    function getMyLocation(myLocationDiv, map) {
        let myLocationBtn = document.createElement('button');
        myLocationBtn.innerHTML = 'Где я?';
        myLocationBtn.className = 'btn btn-info';
        myLocationBtn.style.margin = '5px';
        myLocationBtn.style.opacity = '0.95';
        myLocationBtn.style.borderRadius = '3px';
        myLocationDiv.appendChild(myLocationBtn);

        myLocationBtn.addEventListener('click', function() {
            navigator.geolocation.getCurrentPosition(function(success) {
                map.setCenter(new google.maps.LatLng(success.coords.latitude, success.coords.longitude));
                map.setZoom(12);
            });
        });
    }
}


// Получить все продолжительности в зависимости от типа поездки
function getDurations(callback) {
    let service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
            origins: nodes,
            destinations: nodes,
            travelMode: google.maps.TravelMode[$('#travel-type').val()],
            avoidHighways: parseInt($('#avoid-highways').val()) > 0 ? true : false,
            avoidTolls: true,
        },
        function(distanceData) {
            // Создать массив данных продолжительности маршрута
            let nodeDistanceData;
            for (originNodeIndex in distanceData.rows) {
                nodeDistanceData = distanceData.rows[originNodeIndex].elements;
                durations[originNodeIndex] = [];
                for (destinationNodeIndex in nodeDistanceData) {
                    if (durations[originNodeIndex][destinationNodeIndex] = nodeDistanceData[destinationNodeIndex].duration == undefined) {
                        alert('Ошибка: не удалось получить продолжительность поездки из API');
                        $('#ga-buttons').show();
                        return;
                    }
                    durations[originNodeIndex][destinationNodeIndex] = nodeDistanceData[destinationNodeIndex].duration.value;
                }
            }
            if (callback != undefined) {
                callback();
            }
        });
}

// Удаляет маркеры и временные пути
function clearMapMarkers() {
    markers.forEach(item => item.setMap(null));


    prevNodes = nodes;
    nodes = [];

    if (polylinePath != undefined) {
        polylinePath.setMap(null);
    }

    markers = [];

    $('#ga-buttons').show();
}
// Удаляет направления карты
function clearDirections() {
    // Если показаны направления, удаляет их
    if (directionsDisplay != null) {
        directionsDisplay.setMap(null);
        directionsDisplay = null;
    }
}
// Полностью очищает карту
function clearMap() {
    clearMapMarkers();
    clearDirections();
    $('#destinations-count').html('0');
}

// Инициализация карты Google
window.addEventListener('load', initializeMap);



//////////////////////////////////////////////////////////
let nameOfTrip = '';
//////////////////////////////////////////////////////////



// Создание обработчиков событий
$(document).ready(function() {
    $('#clear-map').click(clearMap);

    // Начать ГА
    $('#find-route').click(function() {
        if (nodes.length < 2) {
            if (prevNodes.length >= 2) {
                nodes = prevNodes;
            } else {
                alert('Нажмите на карту, чтобы добавить точки назначения');
                return;
            }
        }

        if (directionsDisplay != null) {
            directionsDisplay.setMap(null);
            directionsDisplay = null;
        }

        $('#ga-buttons').hide();

        // Получить продолжительность маршрута
        getDurations(function(){
            $('.ga-info').show();

            // Получите конфигурацию и создайте начальную популяцию ГА
            ga.getConfig();
            let pop = new ga.population();
            pop.initialize(nodes.length);
            let route = pop.getFittest().chromosome;

            ga.evolvePopulation(pop, function(update) {
                $('#generations-passed').html(update.generation);
                $('#best-time').html((update.population.getFittest().getDistance() / 60).toFixed(2) + ' Минут');

                // Получить координаты маршрута
                let route = update.population.getFittest().chromosome;
                ///////////////////////////////////////////////////////////////////////////
                fitness.push(update.population.getFittest().fitness * 100000);
                // populations.push(update.population.getFittest().chromosome);
                ///////////////////////////////////////////////////////////////////////////
                let routeCoordinates = [];
                for (index in route) {
                    routeCoordinates[index] = nodes[route[index]];
                }
                routeCoordinates[route.length] = nodes[route[0]];

                // Показать временный маршрут
                if (polylinePath != undefined) {
                    polylinePath.setMap(null);
                }
                polylinePath = new google.maps.Polyline({
                    path: routeCoordinates,
                    strokeColor: "#0066ff",
                    strokeOpacity: 0.75,
                    strokeWeight: 2,
                });
                polylinePath.setMap(map);
            }, function(result) {
                // Получить маршрут
                route = result.population.getFittest().chromosome;

                // Добавить маршрут на карту
                directionsService = new google.maps.DirectionsService();
                directionsDisplay = new google.maps.DirectionsRenderer();
                directionsDisplay.setMap(map);
                directionsDisplay.setPanel(document.getElementById('directionsPanel'));
                let waypts = [];
                for (let i = 1; i < route.length; i++) {
                    waypts.push({
                        location: nodes[route[i]],
                        stopover: true
                    });
                }


                // Добавить окончательный маршрут на карту
                let request = {
                    origin: nodes[route[0]],
                    destination: nodes[route[0]],
                    waypoints: waypts,
                    travelMode: google.maps.TravelMode[$('#travel-type').val()],
                    avoidHighways: parseInt($('#avoid-highways').val()) > 0 ? true : false,
                    // avoidTolls: false
                };
                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                        //////////////////////////////////////////////////////////
                        $('#optimal-route').html(JSON.stringify(request));
                        window.ans = response;
                        window.ans.routes[0].legs.forEach(item => {
                            nameOfTrip += `${item.start_address} -> `;
                        })
                        nameOfTrip += `${window.ans.routes[0].legs[0].start_address}.`;
                        $('#trip_name').val(nameOfTrip);
                    }
                    clearMapMarkers();

                });
            });
        });
    });
});

// код ГА
let ga = {
// Конфигурация по умолчанию
    "crossoverRate": 0.5,
    "mutationRate": 0.1,
    "populationSize": 50,
    "tournamentSize": 5,
    "elitism": true,
    "maxGenerations": 50,
    "tickerSpeed": 60,

// Загружает конфигурацию из входных данных HTML
    "getConfig": function() {
        ga.crossoverRate = parseFloat($('#crossover-rate').val());
        ga.mutationRate = parseFloat($('#mutation-rate').val());
        ga.populationSize = parseInt($('#population-size').val()) || 50;
        ga.elitism = parseInt($('#elitism').val()) || false;
        ga.maxGenerations = parseInt($('#maxGenerations').val()) || 50;
    },

// Эволюционирует с заданной популяцией
    "evolvePopulation": function(population, generationCallBack, completeCallBack) {
// Начать эволюцию
        let generation = 1;
        let evolveInterval = setInterval(function() {
            if (generationCallBack != undefined) {
                generationCallBack({
                    population: population,
                    generation: generation,
                });
            }

// Развивать население
            population = population.crossover();
            population.mutate();
            generation++;

// Если прошло максимальное количество поколений
            if (generation > ga.maxGenerations) {
// Остановить цикл
                clearInterval(evolveInterval);

                if (completeCallBack != undefined) {
                    completeCallBack({
                        population: population,
                        generation: generation,
                    });
                }
            }
        }, ga.tickerSpeed);
    },

// Класс популяции
    "population": function() {
// Вмещает особей населения
        this.individuals = [];

// Начальная популяция случайных особей с заданной длиной хромосом
        this.initialize = function(chromosomeLength) {
            this.individuals = [];

            for (let i = 0; i < ga.populationSize; i++) {
                let newIndividual = new ga.individual(chromosomeLength);
                newIndividual.initialize();
                this.individuals.push(newIndividual);
            }
        };

// Мутирует текущую популяцию
        this.mutate = function() {
            let fittestIndex = this.getFittestIndex();

            for (index in this.individuals) {
// Не мутировать, если это элитный индивидуум и включена элитарность.
                if (ga.elitism != true || index != fittestIndex) {
                    this.individuals[index].mutate();
                }
            }
        };

// Применяет кроссовер к текущей популяции и возвращает популяцию потомков
        this.crossover = function() {
// Создать потомство населения
            let newPopulation = new ga.population();

// Найдите сильнейшего человека
            let fittestIndex = this.getFittestIndex();

            for (index in this.individuals) {
// Добавить без изменений в следующее поколение, если это элитный индивидуум и включена элитарность.
                if (ga.elitism == true && index == fittestIndex) {
// Копировать человека
                    let eliteIndividual = new ga.individual(this.individuals[index].chromosomeLength);
                    eliteIndividual.setChromosome(this.individuals[index].chromosome.slice());
                    newPopulation.addIndividual(eliteIndividual);
                } else {
// Выберите пару
                    let parent = this.tournamentSelection();
// Применить кроссовер
                    this.individuals[index].crossover(parent, newPopulation);
                }
            }

            return newPopulation;
        };

// Добавляет человека в текущую популяцию
        this.addIndividual = function(individual) {
            this.individuals.push(individual);
        };

// Выбирает человека с выбором турнира
        this.tournamentSelection = function() {
// Случайный порядок населения
            for (let i = 0; i < this.individuals.length; i++) {
                let randomIndex = Math.floor(Math.random() * this.individuals.length);
                let tempIndividual = this.individuals[randomIndex];
                this.individuals[randomIndex] = this.individuals[i];
                this.individuals[i] = tempIndividual;
            }

// Создать турнирную популяцию и добавить отдельных индивидуумов
            let tournamentPopulation = new ga.population();
            for (let i = 0; i < ga.tournamentSize; i++) {
                tournamentPopulation.addIndividual(this.individuals[i]);
            }

            return tournamentPopulation.getFittest();
        };

// Возвращает индекс населения самого приспособленного индивидуума
        this.getFittestIndex = function() {
            let fittestIndex = 0;

// Цикл по населению в поисках наиболее приспособленных
            for (let i = 1; i < this.individuals.length; i++) {
                if (this.individuals[i].calcFitness() > this.individuals[fittestIndex].calcFitness()) {
                    fittestIndex = i;
                }
            }

            return fittestIndex;
        };

// Вернуть сильнейшего индивидуума
        this.getFittest = function() {
            return this.individuals[this.getFittestIndex()];
        };
    },

// Класс индивидуумов
    "individual": function(chromosomeLength) {
        this.chromosomeLength = chromosomeLength;
        this.fitness = null;
        this.chromosome = [];

// Инициализировать случайного индивидуума
        this.initialize = function() {
            this.chromosome = [];

// Создать случайную хромосому
            for (let i = 0; i < this.chromosomeLength; i++) {
                this.chromosome.push(i);
            }
            for (let i = 0; i < this.chromosomeLength; i++) {
                let randomIndex = Math.floor(Math.random() * this.chromosomeLength);
                let tempNode = this.chromosome[randomIndex];
                this.chromosome[randomIndex] = this.chromosome[i];
                this.chromosome[i] = tempNode;
            }
        };

// Установить индивидуальную хромосому
        this.setChromosome = function(chromosome) {
            this.chromosome = chromosome;
        };

// Мутировать индивидуума
        this.mutate = function() {
            this.fitness = null;

// Цикл по хромосоме, делающий случайные изменения
            for (index in this.chromosome) {
                if (ga.mutationRate > Math.random()) {
                    let randomIndex = Math.floor(Math.random() * this.chromosomeLength);
                    let tempNode = this.chromosome[randomIndex];
                    this.chromosome[randomIndex] = this.chromosome[index];
                    this.chromosome[index] = tempNode;
                }
            }
        };

// Возвращает расстояние маршрута данного индивидуума
        this.getDistance = function() {
            let totalDistance = 0;

            for (index in this.chromosome) {
                let startNode = this.chromosome[index];
                let endNode = this.chromosome[0];
                if ((parseInt(index) + 1) < this.chromosome.length) {
                    endNode = this.chromosome[(parseInt(index) + 1)];
                }

                totalDistance += durations[startNode][endNode];
            }

            // totalDistance += durations[startNode][endNode];

            return totalDistance;
        };

// Рассчитывает ценность индивидуума
        this.calcFitness = function() {
            if (this.fitness != null) {
                return this.fitness;
            }

            let totalDistance = this.getDistance();

            this.fitness = 1 / totalDistance;
            return this.fitness;
        };

// Применяет кроссовер к текущему индивидууму и партнеру, а затем добавляет его потомство к данной популяции.
        this.crossover = function(individual, offspringPopulation) {
            let offspringChromosome = [];

// Добавить случайное количество генетической информации этого индивидуума к потомству
            let startPos = Math.floor(this.chromosome.length * Math.random());
            let endPos = Math.floor(this.chromosome.length * Math.random());

            let i = startPos;
            while (i != endPos) {
                offspringChromosome[i] = individual.chromosome[i];
                i++

                if (i >= this.chromosome.length) {
                    i = 0;
                }
            }

// Добавьте любую оставшуюся генетическую информацию от партнера индивидуума
            for (parentIndex in individual.chromosome) {
                let node = individual.chromosome[parentIndex];

                let nodeFound = false;
                for (offspringIndex in offspringChromosome) {
                    if (offspringChromosome[offspringIndex] == node) {
                        nodeFound = true;
                        break;
                    }
                }

                if (nodeFound == false) {
                    for (let offspringIndex = 0; offspringIndex < individual.chromosome.length; offspringIndex++) {
                        if (offspringChromosome[offspringIndex] == undefined) {
                            offspringChromosome[offspringIndex] = node;
                            break;
                        }
                    }
                }
            }

// Добавить хромосому к потомству и добавить потомство к популяции
            let offspring = new ga.individual(this.chromosomeLength);
            offspring.setChromosome(offspringChromosome);
            offspringPopulation.addIndividual(offspring);
        };
    },
};
///////////////////////////////////////////////////////////////////////////
// Делаем график оценок поколений
const ctx = document.getElementById('myChart');
function draw(){
    for (let i = 0; i < 50; i++){
        populations[i] = i + 1;
    }
    ctx.style.display = "block";
    ctx.height = 100;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: populations,
            datasets: [{
                label: 'Оценка Поколений',
                data: fitness,
                borderWidth: 1
            }]
        },
        options: {}
    });
}
let haha= document.getElementById("draw");
haha.addEventListener("click", () => {
    draw();
});
document.getElementById("drawFalse").addEventListener("click",() => {ctx.style.display = "none";});
///////////////////////////////////////////////////////////////////////////