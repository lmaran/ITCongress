using Microsoft.Practices.Unity;
using System;
using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Dependencies;
using Web.Repositories;
//using IDependencyResolver = System.Web.Http.Dependencies.IDependencyResolver;

namespace Web.App_Start
{
    public static class DependencyConfig
    {
        public static void Register(HttpConfiguration config)
        {
            var container = new UnityContainer();

            container.RegisterType<IEventRepository, EventRepository>();
            container.RegisterType<ISessionRepository, SessionRepository>();
            container.RegisterType<IWhiteListRepository, WhiteListRepository>();
            

            config.DependencyResolver = new UnityResolver(container);
        }

        // http://www.asp.net/web-api/overview/extensibility/using-the-web-api-dependency-resolver
        public class UnityResolver : IDependencyResolver
        {
            protected IUnityContainer container;

            public UnityResolver(IUnityContainer container)
            {
                if (container == null)
                {
                    throw new ArgumentNullException("container");
                }
                this.container = container;
            }

            public object GetService(Type serviceType)
            {
                try
                {
                    return container.Resolve(serviceType);
                }
                catch (ResolutionFailedException)
                {
                    return null;
                }
            }

            public IEnumerable<object> GetServices(Type serviceType)
            {
                try
                {
                    return container.ResolveAll(serviceType);
                }
                catch (ResolutionFailedException)
                {
                    return new List<object>();
                }
            }

            public IDependencyScope BeginScope()
            {
                var child = container.CreateChildContainer();
                return new UnityResolver(child);
            }

            public void Dispose()
            {
                container.Dispose();
            }
        }

    }
}