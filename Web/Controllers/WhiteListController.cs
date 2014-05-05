using System.Collections.Generic;
using System.Web.Http;
using Web.Models;
using Web.Repositories;
using Web.ViewModels;


namespace Web.Controllers
{
    
    public class WhiteListController : ApiController
    {

        private readonly IWhiteListRepository _whiteListRepository;

        public WhiteListController(IWhiteListRepository whiteListRepository)
        {
            this._whiteListRepository = whiteListRepository;
        }

        [Authorize(Roles = "Admin")]
        [Route("api/{eventId}/whitelist")]
        public IEnumerable<string> GetAll(string eventId)
        {
            return _whiteListRepository.GetAll(eventId);
        }

        [HttpGet]
        [Route("api/{eventId}/whitelist/{email}")]
        public int Get(string eventId, string email)
        {
            return _whiteListRepository.Get(eventId, email);
        }


        [Authorize(Roles = "Admin")]
        [HttpPost]
        [Route("api/{eventId}/whitelist/{email}")]
        public void Post(string eventId, string email)
        {
            _whiteListRepository.Add(eventId, email);
        }

        [HttpDelete]
        [Route("api/{eventId}/whitelist/{email}")]
        public void Delete(string eventId, string email)
        {
            _whiteListRepository.Delete(eventId, email);
        }


    }
}
