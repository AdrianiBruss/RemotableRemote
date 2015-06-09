(function () {
    'use strict';

    /**
     * Controllers
     */

    var app = angular.module('controllers', []);

    /**
     * HomeController for Home Page
     */
    app.controller('homeCtrl', ['$state', 'sitesFactory', 'socketService', function ($state, sitesFactory, socketService) {

        // ------------------------------------------------------
        // Home Page

        // Socket initialisation
        socketService.init();


        var self = this;
        this.sites = {};


        // Récupération des sites dans le localStorage
        this.sites = sitesFactory.getSites();

        // Ecoute la reponse de la connexion du mobile ( nouveau site ou reconnexion )
        socketService.on('mobileConnectedForMobile', function (data) {

            console.log(data);

            if (data.status == 'MobileReConnected') {

                console.log('mobile reconnected');

                sitesFactory.setCurrentSite(data.context);
                $state.go('site.menu');

            } else {

                console.log('premiere connexion');

                var addSitePromise = sitesFactory.addToLocal(data.context);
                addSitePromise.then(function (result) {

                    self.sites = result;

                    //ajouter au service le site courant
                    sitesFactory.setCurrentSite(data.context);

                    $state.go('site.menu');

                });


            }

        });


        // Ouverture d'un site
        this.openSite = function (site) {
            sitesFactory.connectSite(site);
        };

        // Suppression d'un site
        this.deleteSite = function (site) {

            console.log(site);

            socketService.emit('deleteMobile', site, function (data) {

                var deleteSitePromise = sitesFactory.deleteFromLocal(site);
                deleteSitePromise.then(function (result) {

                    //self.sites = result;

                })

            })
        };

        // Ajout d'un site
        this.addSitesButton = function () {
            $state.go('addSite');
        };

    }]);


    /**
     * Controller for main site page
     */
    app.controller('siteCtrl', ['$scope', '$state', '$ionicSideMenuDelegate', 'actionsService', 'socketService', 'sitesFactory',
        function ($scope, $state, $ionicSideMenuDelegate, actionsService, socketService, sitesFactory) {


            this.backToHome = function () {
                $state.go('home');
            };

            // -------------------------------------------------
            var self = this;
            this.layout = sitesFactory.getCurrentSite();

            if (this.layout == null) {
                $state.go('home');
            }
            

            // -------------------------------------------------
            this.swipe = function (dir) {

                switch (dir){
                    case 'up':
                        if (self.currentSection > 0){
                            actionsService.swipeDirection('up');
                            self.gaugeHeight -= self.ratio;
                            self.currentSection -=1;
                            self.transformLinks -= 100
                        }
                        break;
                    case 'down':
                        if (self.currentSection < self.nbSections){
                            actionsService.swipeDirection('down');
                            self.gaugeHeight += self.ratio;
                            self.currentSection +=1;
                            self.transformLinks += 100
                        }
                        break;
                    case 'left':
                        actionsService.swipeDirection('left');
                        break;
                    case 'right':
                        actionsService.swipeDirection('right');
                        break;

                }


            };

            // -------------------------------------------------
            this.openPage = function (url) {
                socketService.emit('changeLinkMobile', url);
            };

            this.toggleRight = function () {
                $ionicSideMenuDelegate.toggleRight();
            };

            console.log(this.layout);
            this.gaugeHeight = 0;
            this.nbSections = this.layout.nbSections -1;
            console.log(this.nbSections);
            this.currentSection = 0;
            this.ratio = Math.round(100/this.nbSections);
            this.linksHeight = this.nbSections * 100;
            console.log(this.linksHeight);
            this.transformLinks = 0;


        }]);


    /**
     * Controller for addSite Page
     */
    app.controller('addSiteCtrl', ['$state', 'sitesFactory', 'socketService', function ($state, sitesFactory, socketService) {

        // ------------------------------------------------------
        // AddSite Page

        var self = this;

        this.colors = ['6C7A89', 'F2784B', 'F9BF3B', '00B16A', '87D37C', '4B77BE', '2C3E50', 'F64747', 'AEA8D3', '674172'];

        this.keyColor = [];
        this.key = '';

        this.addColor = function (color) {

            if (self.keyColor.length < 4) {
                self.keyColor.push(color);
                self.key += color;
            }
        };

        // Supprime les carrés de couleur
        this.removeColors = function () {

            self.key = '';
            self.keyColor = [];

        };

        this.getColor = function (index) {
            return {
                'backgroundColor': '#' + self.colors[self.keyColor[index]] + ''
            }
        };

        // Revenir sur la home
        this.backToHome = function () {
            $state.go('home');
        };

        // AddSite Form
        this.errorMessage = false;
        this.res = {};

        // AddSite function
        this.addSite = function (form) {

            if (form.$valid) {

                self.errorMessage = false;
                // AddSite
                sitesFactory.addSite(self.key);

                self.key = '';
                self.keyColor = [];

            } else {

                self.errorMessage = true;

            }

        };

    }]);

})();


