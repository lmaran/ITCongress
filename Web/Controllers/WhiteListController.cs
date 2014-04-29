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

        [Route("api/{eventId}/whitelist")]
        public IEnumerable<string> Get(string eventId)
        {
            return _whiteListRepository.GetAll(eventId);
        }

        [Route("api/{eventId}/whitelist/{email}")]
        public string Get(string eventId, string email)
        {
            return _whiteListRepository.Get(eventId, email);
        }


    }
}
