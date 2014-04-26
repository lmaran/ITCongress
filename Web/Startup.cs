using Owin;
using System.Web.Http;
using Web.App_Start;

namespace Web
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            //
            // Web API configuration
            //
            var config = new HttpConfiguration();
            WebApiConfig.Register(config);
            DependencyConfig.Register(config);
            app.UseWebApi(config);
        }
    }
}