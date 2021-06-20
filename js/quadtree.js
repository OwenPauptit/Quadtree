class Point
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
        
        this.ax = Math.random() - 0.5;
        this.ay = Math.random() - 0.5;
        this.vx = 0;
        this.vy = 0;
    }

    move = function()
    {
        this.ax += Math.random() * 2 - 1;
        this.ay += Math.random() * 2 - 1;
        this.vx += this.ax;
        while(Math.abs(this.vx) > 5)
        {
            this.vx *= Math.random();
        }
        this.vy += this.ay;
        while(Math.abs(this.vy) > 5)
        {
            this.vy *= Math.random();
        }
        this.x += Math.floor(this.vx);
        this.y += Math.floor(this.vy);

        if (this.x >= 400)
        {
            this.x = 399;
            this.ax = -1;
        }
        if (this.y >= 400)
        {
            this.y = 399;
            this.ay = -1;
        }
        if (this.y <= 0)
        {
            this.y = 1;
            this.ay = 1;
        }
        if (this.x <= 0)
        {
            this.x = 1;
            this.ax = 1;
        }
        
    }
}

class Rectangle
{
    constructor(x,y,w,h)
    {
        // x,y are centre of rect
        // w,h are half lengths
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains = function(p)
    {
        return p.x <= this.x + this.w && p.x >= this.x - this.w && p.y <=  this.y + this.h && p.y >= this.y - this.h;
    }
}

class Quadtree
{
    constructor(boundary, n)
    {
        this.boundary = boundary;
        this.capacity = n;
        this.originalcapacity = n;
        this.points = [];
        this.divided = false;
    }
    
    subdivide = function()
    {
        let nw = new Rectangle(this.boundary.x - Math.floor(this.boundary.w/2),this.boundary.y - Math.floor(this.boundary.h/2),Math.floor(this.boundary.w/2),Math.floor(this.boundary.h/2));
        let ne = new Rectangle(this.boundary.x + Math.floor(this.boundary.w/2),this.boundary.y - Math.floor(this.boundary.h/2),Math.floor(this.boundary.w/2),Math.floor(this.boundary.h/2));
        let sw = new Rectangle(this.boundary.x - Math.floor(this.boundary.w/2),this.boundary.y + Math.floor(this.boundary.h/2),Math.floor(this.boundary.w/2),Math.floor(this.boundary.h/2));
        let se = new Rectangle(this.boundary.x + Math.floor(this.boundary.w/2),this.boundary.y + Math.floor(this.boundary.h/2),Math.floor(this.boundary.w/2),Math.floor(this.boundary.h/2));
        this.northwest = new Quadtree(nw,this.capacity);
        this.northeast = new Quadtree(ne,this.capacity);
        this.southwest = new Quadtree(sw,this.capacity);
        this.southeast = new Quadtree(se,this.capacity);
        this.divided = true;
    }

    merge = function()
    {
        if(this.divided)
        {       
            this.points = this.points.concat(this.northwest.merge());
            this.points = this.points.concat(this.northwest.merge());
            this.points = this.points.concat(this.southwest.merge());
            this.points = this.points.concat(this.southeast.merge());
            this.northwest = null;
            this.northeast = null;
            this.southeast = null;
            this.southwest = null;
            this.capacity = this.originalcapacity;
        }
        this.divided = false;
        return this.points;
    }

    insert = function(point)
    {
        if(!this.boundary.contains(point))
        {
            //console.log(point,this.boundary);
            return false;
        }
        this.points.push(point);
        if (this.points.length > this.capacity)
        {
            if (!this.divided)
            {
                this.subdivide();
            }
            for (let i = 0; i < this.points.length; i++)
            {
                var a = this.northeast.insert(this.points[i]);
                var b = this.southeast.insert(this.points[i]);
                var c = this.northwest.insert(this.points[i]);
                var d = this.southwest.insert(this.points[i]);
                if (!(a || b || c || d))
                {
                    return false;
                }
            }
            this.capacity = 0;
            this.points = [];
        }
        return true;
    }

    update = function()
    {
        let p = []
        let sum = 0;
        
        if (this.divided)
        {
            let a = this.northwest.update();
            let b = this.northeast.update();
            let c = this.southwest.update();
            let d  =this.southeast.update();
            p = p.concat(a[0]);
            p = p.concat(b[0]);
            p = p.concat(c[0]);
            p = p.concat(d[0]);
            sum += a[1] + b[1] + c[1] + d[1];

            if (sum <= this.originalcapacity)
            {
                this.merge();
            }
        }
        else
        {
            for (var i = 0; i < this.points.length; i++)
            {
                this.points[i].move();
                if (!this.boundary.contains(this.points[i]))
                {
                    //console.log(this.points[i].x,this.points[i].y);
                    p.push(this.points[i]);
                    this.points.splice(i);
                }
            }
            sum += this.points.length;
        }
        return [p, sum];
    }

    show = function(ctx)
    {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.boundary.x - this.boundary.w, this.boundary.y - this.boundary.h);
        ctx.lineTo(this.boundary.x + this.boundary.w, this.boundary.y - this.boundary.h);
        ctx.lineTo(this.boundary.x + this.boundary.w, this.boundary.y + this.boundary.h);
        ctx.lineTo(this.boundary.x - this.boundary.w, this.boundary.y + this.boundary.h);
        ctx.lineTo(this.boundary.x - this.boundary.w, this.boundary.y - this.boundary.h);
        ctx.stroke();
        if (this.divided)
        {
            this.northeast.show(ctx);
            this.southeast.show(ctx);
            this.northwest.show(ctx);
            this.southwest.show(ctx);
        }
        ctx.fillStyle = "white";
        for (let p of this.points)
        {
            ctx.beginPath();
            ctx.arc(p.x,p.y,3,0,Math.PI*2);
            ctx.fill();
        }
    }
}