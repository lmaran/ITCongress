using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http.Filters;

namespace Web.Helpers
{
    public class CacheControl : System.Web.Http.Filters.ActionFilterAttribute
    {
        public int MaxAge { get; set; }

        public CacheControl()
        {
            MaxAge = 3600;
        }

        public override void OnActionExecuted(HttpActionExecutedContext context)
        {
            context.Response.Headers.CacheControl = new CacheControlHeaderValue()
            {
                Public = true,
                MaxAge = TimeSpan.FromSeconds(MaxAge)
            };

            //context.Response.Headers.ETag = new EntityTagHeaderValue("\"1\"");
            //context.Response.Content.Headers.LastModified = DateTime.Now.AddDays(-1);

            base.OnActionExecuted(context);
        }
    }
}