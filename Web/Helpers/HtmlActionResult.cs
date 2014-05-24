using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Hosting;
using System.Web.Http;
using System.Linq;

namespace Web.Helpers
{
    /// <summary>
    /// This helper reads a simple html file, converts to a string and then returns it as "text/html" HTTP response
    /// To read and parse a Razor file, see http://www.strathweb.com/2013/06/ihttpactionresult-new-way-of-creating-responses-in-asp-net-web-api-2/
    /// </summary>
    public class HtmlActionResult : IHttpActionResult
    {
        private static readonly string _rootPath = HostingEnvironment.MapPath("~/App");
        private static readonly TimeSpan _cacheTimeSpan = TimeSpan.FromDays(1); // The maximum age this resource will be cached on the client side
        
        private readonly string _fileName;
        private readonly HttpRequestMessage _request;

        public HtmlActionResult(HttpRequestMessage request, string fileName)
        {
            _fileName = fileName;
            _request = request;
        }

        // ok, without cache
        //public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        //{
        //    string filePath = Path.Combine(_rootPath, _fileName);
        //    var response = new HttpResponseMessage(HttpStatusCode.OK);

        //    // met.1 (MSDN): http://msdn.microsoft.com/en-us/library/ezwyzy7b.aspx, (Darrel M.): http://stackoverflow.com/a/8122393
        //    //response.Content = new StringContent(File.ReadAllText(filePath));

        //    // met.2 http://stackoverflow.com/a/20888749
        //    response.Content = new StreamContent(File.OpenRead(filePath));

        //    //response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/html");
        //    response.Content.Headers.Add("Content-Type","text/html; charset=utf-8");
        //    return Task.FromResult(response);
        //}

        // ok, with cache
        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            string filePath = Path.Combine(_rootPath, _fileName);
            var fileInfo = new FileInfo(filePath);

            DateTime lastModifiedDateTime = fileInfo.LastWriteTimeUtc;
            string entityTag = string.Concat("\"", lastModifiedDateTime.ToBinary().ToString("X"), "\"");

            EntityTagHeaderValue requestTag = _request.Headers.IfNoneMatch.FirstOrDefault();

            bool modifiedContent = requestTag == null || requestTag.Tag != entityTag; // can also check Request.Headers.IfModifiedSince == lastModifiedOffset;
            bool suppressContent = _request.Method == HttpMethod.Head; // headers only

            HttpResponseMessage response = _request.CreateResponse(modifiedContent ? HttpStatusCode.OK : HttpStatusCode.NotModified);

            if (modifiedContent && !suppressContent)
            {
                // METH 1. Stream content to client
                response.Content = new StreamContent(fileInfo.OpenRead())
                {
                    Headers = { ContentLength = fileInfo.Length }
                };

                // METH 2.  Send string content to client; (MSDN): http://msdn.microsoft.com/en-us/library/ezwyzy7b.aspx, (Darrel M.): http://stackoverflow.com/a/8122393
                // response.Content = new ByteArrayContent(File.ReadAllBytes(filePath));
            }
            else
            {
                // Empty content (headers only)
                response.Content = new ByteArrayContent(new byte[0]);
            }

            // Revalidate -> No cache
            //if (modifiedContent)
            //{
            //    // Add conditional caching headers
            //    response.Headers.ETag = new EntityTagHeaderValue(entityTag);
            //    response.Headers.CacheControl = new CacheControlHeaderValue
            //    {
            //        MustRevalidate = true,
            //        MaxAge = _cacheTimeSpan
            //    };
            //}

            // Add conditional caching headers
            response.Headers.ETag = new EntityTagHeaderValue(entityTag);
            response.Headers.CacheControl = new CacheControlHeaderValue
            {
                Public = true,
                MaxAge = _cacheTimeSpan
            };

            // Always send the content headers to client
            response.Content.Headers.LastModified = lastModifiedDateTime;
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/html") { CharSet = "utf-8" };

            return Task.FromResult(response);
        }
    }
}