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
    public class UserDetailsController : ApiController
    {

        private readonly IUserDetailsRepository _userDetailsRepository;

        public UserDetailsController(IUserDetailsRepository userDetailsRepository)
        {
            this._userDetailsRepository = userDetailsRepository;
        }

        //[Authorize(Roles = "Admin")]
        [Route("api/{eventId}/userdetails")]
        public IEnumerable<UserDetailViewModelWithPsw> GetAll(string eventId)
        {

            var context = new ApplicationDbContext();
            var allUsersWithPsw = new List<string>();
            allUsersWithPsw = context.Users.Select(x => x.Email).ToList();

            var allUserDetails =  _userDetailsRepository.GetAll(eventId);

            var response = new List<UserDetailViewModelWithPsw>();
            foreach (var userDetails in allUserDetails)
            {
                var usr = new UserDetailViewModelWithPsw(){
                        Email = userDetails.Email,
                        FirstName= userDetails.FirstName,
                        LastName = userDetails.LastName,
                        Company= userDetails.Company,
                        Title= userDetails.Title,
                        Phone= userDetails.Phone,
                        Owner= userDetails.Owner,
                        HasPassword = allUsersWithPsw.Any(x => x == userDetails.Email)
                };
                response.Add(usr);
            };
            return response;
        }

        [HttpGet]
        [Route("api/{eventId}/userdetails/{email}")]
        public UserDetailViewModel Get(string eventId, string email)
        {
            var userDetail =  _userDetailsRepository.Get(eventId, email);
            if (userDetail == null) 
                throw new HttpResponseException(HttpStatusCode.NotFound);

            return userDetail;
        }


        //[Authorize(Roles = "Admin")]
        [HttpPost]
        [Route("api/{eventId}/userdetails")]
        public IHttpActionResult Post(string eventId, [FromBodyAttribute] UserDetailViewModel userDetail)
        {
            var ud = _userDetailsRepository.Get(eventId, userDetail.Email);
            if (ud != null) return Conflict();

            _userDetailsRepository.Add(eventId, userDetail);
            return Created<UserDetailViewModel>(Request.RequestUri + "/" + HttpUtility.UrlEncode(userDetail.Email.ToLower()) + "/", userDetail);
        }

        //[HttpDelete]
        [Route("api/{eventId}/userdetails/{email}")]
        public IHttpActionResult Delete(string eventId, string email)
        {
            var ud = _userDetailsRepository.Get(eventId, email);
            if (ud == null) return NotFound();

            _userDetailsRepository.Delete(eventId, email);

            return StatusCode(HttpStatusCode.NoContent); //204
        }


    }
}
