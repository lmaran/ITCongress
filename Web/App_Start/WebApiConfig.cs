using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Web.Http;

namespace Web.App_Start
{
    public static class WebApiConfig 
    {
        public static void Register(HttpConfiguration config)
        {
            // formating JSON data - http://maran.ro/2014/02/16/afisarea-in-browser-a-unui-obiect-json-culori-indentare-grupare/
            //var jsonFormatter = config.Formatters.JsonFormatter;
            //var settings = jsonFormatter.SerializerSettings;

            //settings.Formatting = Formatting.Indented; // Indenting
            //settings.ContractResolver = new CamelCasePropertyNamesContractResolver(); // Camel Casing

            config.Formatters.Remove(config.Formatters.XmlFormatter);

            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver(); //Camel Case for JSON data


            // Enabling Attribute Routing
            config.MapHttpAttributeRoutes();

            // Convention-based routing
            config.Routes.MapHttpRoute(
               name: "DefaultApi",
               routeTemplate: "api/{controller}/{id}",
               defaults: new { id = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
            name: "Home",
            routeTemplate: "{*anything}",
            defaults: new { controller = "Home" });
        }
    }
}