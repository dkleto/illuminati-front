'use strict';

var scheduleCtrl = angular.module('scheduleCtrl', [
   'illuminati-conf'
]);

scheduleCtrl.controller('scheduleCtrl', ['$scope', '$http', 'config', function($scope, $http, config) {

    $http.get(config.apiUrl + '/schedules')
        .success(function(data) {
            $scope.schedules = data;
        })
        .error(function(data, status) {
        });
    $scope.gamutB = {
        'r' : {'x' : 0.675, 'y' : 0.322},
        'g' : {'x' : 0.409, 'y' : 0.518},
        'b' : {'x' : 0.167, 'y' : 0.04}
    };
    $scope.xyPoint = function(x, y) {
        // Check that x and y are both positive integers.
        function checkVal(val) {
          if (typeof val !== 'number') {
            throw new Error('"' + val + '" is not an integer');
          }
          if (val > 1 || val < 0) {
            throw new Error('"' + val + '" is not an integer between 0 and 1');
          }
        }
        checkVal(x);
        checkVal(y);
        return {'x' : x, 'y': y};
    }
    $scope.getSchedColor = function(schedule) {
        var color = '#FFFFFF';
        var xy = schedule['xy'];
        if (typeof xy == 'object') {
          var xy = $scope.xyPoint(xy['x'], xy['y']);
          var rgb = $scope.xyToRgb(xy);
          color = $scope.rgbToHex(rgb.r, rgb.g, rgb.b);
        } else if (typeof xy != 'undefined') {
          throw new Error('XY has incorrect type: "' + typeof xy + '"');
        }
        return {'background-color' : color};
    };
    $scope.xyToRgb = function(point) {
        var z = 1.0 - point.x - point.y;
        var Y = 1.0;
        var X = (Y / point.y) * point.x;
        var Z = (Y / point.y) * z;

        // sRGB D65 conversion
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

        // Apply gamma correction
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

        return {'r' : r, 'g' : g, 'b' : b};
    };
    $scope.rgbToHex = function(r, g, b) {
        var numToHex = function(number) {
            var result;
            result = Math.floor(Math.round(number * 255) / 16).toString(16);
            result += (Math.round(number * 255) % 16).toString(16);
            return result;
        }
        return ('#' + numToHex(r) + numToHex(g) + numToHex(b)).toUpperCase();
    };
    $scope.crossProduct = function(p1, p2) {
        return (p1.x * p2.y - p1.y * p2.x);
    }
    $scope.pointInGamut = function(x, y, gamut) {
        return null;
    }
}]);
