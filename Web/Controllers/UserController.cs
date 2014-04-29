using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Security;
using Web.App_Start;
using Web.Models;

namespace Web.Controllers
{
    public class UserController : ApiController
    {
        // GET: api/User
        [Route("api/users")]
        public IEnumerable<object> Get()
        {
            var context = new ApplicationDbContext();
            return context.Users.Select(x => new
            {
                Id = x.Id,
                LastName = x.LastName,
                FirstName = x.FirstName,
                PhoneNumber = x.PhoneNumber, 
                Email = x.Email,
                Company = x.Company,
                City = x.Hometown,
                Title = x.Title,
                Status = x.Status
            });
        }

        // GET: api/User/5
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/User
        public void Post([FromBody]string value)
        {
        }

        [HttpPut]
        [Route("api/users/{userId}/{newStatus}")] // api/users/694f9650-0005-4941-922c-0eff2aed355f/Rejected
        public void Put(string userId, string newStatus)
        {
            // met.1 /http://weblogs.asp.net/imranbaloch/archive/2013/12/12/a-simple-implementation-of-microsoft-aspnet-identity.aspx
            var context = new ApplicationDbContext();
            var user = context.Users.FirstOrDefault(x => x.Id == userId);
            user.Status = newStatus;
            //context.Users.Attach(user);
            context.Entry(user).State = System.Data.Entity.EntityState.Modified;
            //context.Configuration.ValidateOnSaveEnabled = false;
            context.SaveChanges();

            //met 2 http://stackoverflow.com/a/22508815
            //var userStore = new UserStore<ApplicationUser>(new ApplicationDbContext());
            //var manager = new ApplicationUserManager(userStore);
            //manager.UpdateAsync(user);
            //var context2 = userStore.Context;
            //context2.SaveChanges();

        }

        // DELETE: api/User/5
        public void Delete(int id)
        {
        }
    }
}
