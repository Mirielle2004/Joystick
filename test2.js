console.log("test2")

CanvasRenderingContext2D.prototype.__proto__ = {

    /**
     * 
     * @description Draws a customizable arc 
     * @param {number} x centre point on the X-axis
     * @param {number} y centre point on the Y-axis
     * @param {number} radius radius of the circle
     * @param {string} fill fillStyle for the circle
     * @param {string} stroke strokeStyle for the circle
     * @param {number} width thickness only if strokeStyle is being used
     * 
     */

    Joystick2dArc(x, y, radius, fill, stroke, width=0) {
        this.save();
        this.lineWidth = width;
        this.strokeStyle = stroke || fill;
        this.fillStyle = fill;
        this.beginPath();
        this.arc(x, y, radius, 0, 2 * Math.PI);
        this.closePath();
        if(!(stroke === "none" || stroke === "")) this.stroke();
        if(!(fill === undefined || fill === "none" || fill === "")) this.fill();
        this.restore();
    }
};

/**
 * @description principal object that initializes and draws a joystick
 */
class Joystick {
    /**
     * 
     * @constructor
     * @param {object} arg an object that accepts a predefined keys and map
     * their values to the respected component of the joystick
     * 
     */
    constructor(arg) {
        this.canvas = arg.canvas;
        try {
            this.ctx = this.canvas.getContext("2d");
        } catch (error) {
            throw ("Joystick Failed to intialize CANVAS");
        }
        
        // positioning
        this.x = arg.x || this.canvas.width / 2;
        this.y = arg.y || this.canvas.height / 2;
        this.origin = {x: arg.x || this.x, y: arg.y || this.y};
        this.radius = arg.size || 50;
        this.obj = arg.component;
        this.speed = arg.speed || {value:1, max:2, type:"dynamic"};

        // styling
        this.color = arg.color || "lightgray";
        this.lineWidth = arg.lineWidth || 4;
        this.outlineColor = arg.outlineColor || "#222";
        this.backgroundColor = arg.backgroundColor || "none";
        this.backgroundOutlineColor = arg.backgroundOutlineColor || "#222";
        this.backgroundLineWidth = arg.backgroundLineWidth || 4;
        
        this.radius1 = 15;
        this.angle = 0;
        this.isActive = false;
        this.timeSpan = 10;
        this.timeSpanCounter = this.timeSpan;
        this.speedCounter = 0;
        this.isDisplay = false;
        this.isFading = false;
        this.alpha = 1;

        this.__diffX = null;
        this.__diffY = null;
     
       console.log("Created ");
    }

    /**
     * @description draw joystick on the canvas
     */
    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.alpha;
        this.ctx.Joystick2dArc( this.origin.x, this.origin.y, this.radius, 
        this.backgroundColor, this.backgroundOutlineColor, this.backgroundLineWidth);   

        this.ctx.Joystick2dArc( this.x, this.y, this.radius1, 
            this.color, this.outlineColor, this.lineWidth);
        this.ctx.restore();
    }

    /**
     * @description accelerate the object binded to the joystick
     * @returns {number} the speed's value
     */
    accelerate() {
        let l = Math.hypot(this.__diffX, this.__diffY);
        let speed = l / (this.speed.max * 10 + this.speed.value);
        if(speed >= this.speed.max) speed = this.speed.max;
        return speed;
    }

    /**
     * @description move the binded object to a desired position
     */
    moveObj() {
        if(this.isActive) {
            if(!this.obj.x || !this.obj.y || typeof this.obj.x !== "number" 
            || typeof this.obj.y !== "number") {
                console.error("Binded component Must be a 2D Vector with a {[X, Y]:number} value");
            } else {
                let speed = this.accelerate();
                this.obj.x += Math.cos(this.angle) * speed;
                this.obj.y += Math.sin(this.angle) * speed;
            }
            
        }
    }

    /**
     * @description fade out the joystick when not focused
     */
    fadeIn() {
        if(this.isFading) {
            this.timeSpanCounter-=1;
            this.alpha = Math.abs(this.timeSpanCounter / this.timeSpan);
            if(this.alpha <= 0) {
                this.isDisplay = false;
                this.timeSpanCounter = this.timeSpan;
            }
        }
        

    }

    /**
     * @description call this method to update the joystick
     */
    update() {
        if(this.isDisplay) this.draw();
        this.moveObj();
        this.fadeIn();
    }

    /**
     * @description contain's events binded to the joystick
     */
    activate() {
        console.log("activated");
        // mouse used in development
        if("mousedown" in document.documentElement) {
            this.ctx.canvas.addEventListener("mousedown", e => {
                this.origin.x = e.clientX;
                this.origin.y = e.clientY;
                this.x = e.clientX;
                this.y = e.clientY;
                this.isActive = true;
                this.isDisplay = true;           
                this.isFading = false;
                this.alpha = 1;
            });

            this.ctx.canvas.addEventListener("mousemove", e => {
                let diffX = e.clientX - this.origin.x;
                let diffY = e.clientY - this.origin.y;
                let magnitude = Math.hypot(diffX, diffY);
                this.angle = Math.atan2(diffY, diffX);
                this.isActive = true;
                this.__diffX = diffX;
                this.__diffY = diffY;

                let radius = Math.min(magnitude, this.radius);
                this.x = this.origin.x + Math.cos(this.angle) * radius;
                this.y = this.origin.y + Math.sin(this.angle) * radius;
            });

            this.ctx.canvas.addEventListener("mouseup", e => {
                this.isActive = false;
                this.x = this.origin.x;
                this.y = this.origin.y;
                if(this.speed.type.toLowerCase() === "dynamic")
                    this.speed.value = 0;
                this.isFading = true;
            });
        }

        // check for touches
        if("touchstart" in document.documentElement) {

            this.ctx.canvas.addEventListener("touchstart", e => {
                // const {pageX, pageX} = e.touches[0];
                this.origin.x = e.touches[0].pageX;
                this.origin.y = e.touches[0].pageY;
                this.x = e.touches[0].pageX;
                this.y = e.touches[0].pageY;
                this.isActive = true;
                this.isDisplay = true;           
                this.isFading = false;
                this.alpha = 1;
            });
    
            this.ctx.canvas.addEventListener("touchmove", e => {
                let diffX = e.touches[0].pageX - this.origin.x;
                let diffY = e.touches[0].pageY - this.origin.y;
                let magnitude = Math.hypot(diffX, diffY);
                this.angle = Math.atan2(diffY, diffX);
                this.isActive = true;
                this.__diffX = diffX;
                this.__diffY = diffY;
    
                let radius = Math.min(magnitude, this.radius);
                this.x = this.origin.x + Math.cos(this.angle) * radius;
                this.y = this.origin.y + Math.sin(this.angle) * radius;
            });
    
            this.ctx.canvas.addEventListener("touchend", e => {
                this.isActive = false;
                this.x = this.origin.x;
                this.y = this.origin.y;
                if(this.speed.type.toLowerCase() === "dynamic")
                    this.speed.value = 0;
                this.isFading = true;
            });
        }
        
    }
}
