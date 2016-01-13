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

        r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
        g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
        b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;

        var numToHex = function(number) {
            var result;
            result = Math.floor(Math.round(number * 255) / 16).toString(16);
            result += (Math.round(number * 255) % 16).toString(16);
            return result;
        }

        return numToHex(r) + numToHex(g) + numToHex(b);
    }
    $scope.hexFromHsl = function(h, s, l) {
        var r, g, b;

        h = h / 65535;
        s = s / 255;
        l = l / 255;

        if(s == 0){
            r = g = b = l;
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        var numToHex = function(number) {
            var result;
            result = Math.floor(Math.round(number * 255) / 16).toString(16);
            result += (Math.round(number * 255) % 16).toString(16);
            return result;
        }

        return numToHex(r) + numToHex(g) + numToHex(b);
    }
}]);
