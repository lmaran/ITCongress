using Web.Helpers;
using Web.Models;
using Web.ViewModels;
using AutoMapper;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;

namespace Web.Repositories
{
    public class EventSessionRepository : TableStorage<EventSessionEntry>, IEventSessionRepository
    {
        public EventSessionRepository()
            : base(tableName: "eta2u77EventSessions")
        {
        }
      

        public IEnumerable<EventSessionViewModel> GetByPk(String eventId)
        {
            var filter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, eventId);
            //ok
            //var query = new TableQuery<EventSessionEntry>().Where(filter);
            //var entitiesTable = Table.ExecuteQuery<EventSessionEntry>(query);
            var entitiesTable = this.ExecuteQuery(filter);

            //// ok, manual
            //var entitiesVM = new List<EventSessionViewModel>();
            //foreach (var i in entitiesTable)
            //{
            //    List<Presenter> deserializedPresenters = JsonConvert.DeserializeObject<List<Presenter>>(i.Presenters);
            //    List<RegisteredAttendee> deserializedRegisteredAttendees = JsonConvert.DeserializeObject<List<RegisteredAttendee>>(i.RegisteredAttendees);
            //    entitiesVM.Add(new EventSessionViewModel { Address = i.Address, BeginOn = i.BeginOn, EndOn = i.EndOn, Room = i.Room, EventSessionId = i.RowKey, Title = i.Title, Description = i.Description, Url = i.Url, Presenters = deserializedPresenters, MaxAttendees = i.MaxAttendees, RegisteredAttendees = deserializedRegisteredAttendees });
            //}


            // ok, automapper: copy "entitiesTable" to "entitiesVM"
            Mapper.CreateMap<EventSessionEntry, EventSessionViewModel>()
                .ForMember(dest => dest.EventSessionId, opt => opt.MapFrom(src => src.RowKey))
                .ForMember(dest => dest.Presenters, opt => opt.MapFrom(src => JsonConvert.DeserializeObject<List<Presenter>>(src.Presenters ?? string.Empty)))
                .ForMember(dest => dest.RegisteredAttendees, opt => opt.MapFrom(src => JsonConvert.DeserializeObject<List<RegisteredAttendee>>(src.RegisteredAttendees ?? string.Empty)));

            var entitiesVM = Mapper.Map<List<EventSessionEntry>, List<EventSessionViewModel>>(entitiesTable.ToList()); //neaparat cu ToList()

            return entitiesVM;
        }

        public EventSessionViewModel GetByKeys(String pk, String rk) //pk=eventId; rk=eventSessionId
        {
            //ok
            //var operation = TableOperation.Retrieve<EventSessionEntry>(pk, rk);
            //var result = Table.Execute(operation);
            //var i = (EventSessionEntry)result.Result;
            var i = this.Retrieve(pk, rk);

            if (i == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            //// ok, manual
            //List<Presenter> deserializedPresenters = JsonConvert.DeserializeObject<List<Presenter>>(i.Presenters ?? string.Empty);
            //List<RegisteredAttendee> deserializedRegisteredAttendees = JsonConvert.DeserializeObject<List<RegisteredAttendee>>(i.RegisteredAttendees ?? string.Empty);
            //return new EventSessionViewModel { Address = i.Address, BeginOn = i.BeginOn, EndOn = i.EndOn, Room = i.Room, EventSessionId = i.RowKey, Title = i.Title, Description = i.Description, Url = i.Url, Presenters = deserializedPresenters, MaxAttendees = i.MaxAttendees, RegisteredAttendees = deserializedRegisteredAttendees };

            // ok, automapper: copy "entitiesTable" to "entitiesVM"
            Mapper.CreateMap<EventSessionEntry, EventSessionViewModel>()
                .ForMember(dest => dest.EventSessionId, opt => opt.MapFrom(src => src.RowKey))
                .ForMember(dest => dest.Presenters, opt => opt.MapFrom(src => JsonConvert.DeserializeObject<List<Presenter>>(src.Presenters ?? string.Empty)))
                .ForMember(dest => dest.RegisteredAttendees, opt => opt.MapFrom(src => JsonConvert.DeserializeObject<List<RegisteredAttendee>>(src.RegisteredAttendees ?? string.Empty)));

            var entityVM = Mapper.Map<EventSessionEntry, EventSessionViewModel>(i);

            return entityVM;        
        }

        public void UpdateProperty(string pk, string rk, string propertyName,  string propertyValue)
        {
            var f = new DynamicTableEntity();

            f.PartitionKey = pk;
            f.RowKey = rk;
            f.ETag = "*"; //neaparat

            f.Properties.Add(propertyName, new EntityProperty(propertyValue));
            //f.Properties.Add("ModifiedOn", new EntityProperty(DateTime.UtcNow));


            var operation = TableOperation.Merge(f);
            Table.Execute(operation);
        }
    }


    public interface IEventSessionRepository : ITableStorage<EventSessionEntry>
    {
        IEnumerable<EventSessionViewModel> GetByPk(String eventId);
        EventSessionViewModel GetByKeys(String pk, String rk);
        void UpdateProperty(string pk, string rk, string propertyName, string propertyValue);
    }
}