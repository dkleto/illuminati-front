'use strict';

var illuminati = angular.module('illuminati', ['illuminati-conf']);

illuminati.controller('scheduleCtrl', ['$scope', '$http', 'config', function($scope, $http, config) {

    $http.get(config.apiUrl + '/schedules')
        .success(function(data) {
            $scope.schedules = data;
        })
        .error(function(data, status) {
        });
    $scope.hexFromXy = function(x, y, bri) {
        var z = 1.0 - x - y;
        var Y = bri;
        var X = (Y / y) * x;
        var Z = (Y / y) * z;

        var r =  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
        var g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
        var b =  X * 0.051713 - Y * 0.121364 + Z * 1.011530;

        if (r > b && r > g && r > 1.0) {
            // red is too big
            g = g / r;
            b = b / r;
            r = 1.0;
        }
        else if (g > b && g > r && g > 1.0) {
            // green is too big
            r = r / g;
            b = b / g;
            g = 1.0;
        }
        else if (b > r && b > g && b > 1.0) {
            // blue is too big
            r = r / b;
            g = g / b;
            b = 1.0;
        }

        r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
        g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
        b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;

        if (r > b && r > g) {
            // red is biggest
            if (r > 1.0) {
                g = g / r;
                b = b / r;
                r = 1.0;
            }
        }
        else if (g > b && g > r) {
            // green is biggest
            if (g > 1.0) {
                r = r / g;
                b = b / g;
                g = 1.0;
            }
        }
        else if (b > r && b > g) {
            // blue is biggest
            if (b > 1.0) {
                r = r / b;
                g = g / b;
                b = 1.0;
            }
        }
        console.log(r+' '+g+' '+b);

        var numToHex = function(number) {
            var result;
            result = Math.floor(Math.round(number * 255) / 16).toString(16);
            result += (Math.round(number * 255) % 16).toString(16);
            return result;
        }

        return numToHex(r) + numToHex(g) + numToHex(b);
    }
}]);
