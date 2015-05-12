using System.Collections.Generic;
using System.Net;
using System.Web;
using System.Web.Http;
using System.Web.Http.Results;
using Web.Models;
using Web.Repositories;
using Web.ViewModels;
using System.Linq;

namespace Web.Controllers
{
    // from Landing Page
    public class TestDetailsController : ApiController
    {

        //[Authorize(Roles = "Admin")]
        [Route("api/test")]
        public string Get()
        {
            return System.Configuration.ConfigurationManager.AppSettings["Cortizo_Azure_URI"];
        }



    }
}
