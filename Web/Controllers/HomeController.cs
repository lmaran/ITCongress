using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Hosting;
using System.Web.Http;
using Web.Helpers;

namespace Web.Controllers
{
    public class HomeController : ApiController
    {

        //public string Get()
        //{
        //    return "hello world";
        //}

        public HtmlActionResult Get()
        {
            return new HtmlActionResult(Request, "index.html"); 
        }


    }
}
