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
    public class SessionRepository : TableStorage<SessionEntry>, ISessionRepository
    {
        public SessionRepository()
            : base(tableName: "eta2u77Sessions")
        {
        }
      

        public IEnumerable<SessionViewModel> GetByPk(String eventId)
        {
            var filter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, eventId);
            var entitiesTable = this.ExecuteQuery(filter);

            // automapper: copy "entitiesTable" to "entitiesVM"
            Mapper.CreateMap<SessionEntry, SessionViewModel>()
                .ForMember(dest => dest.EventId, opt => opt.MapFrom(src => src.PartitionKey))
                .ForMember(dest => dest.SessionId, opt => opt.MapFrom(src => src.RowKey))
                .ForMember(dest => dest.Speakers, opt => opt.MapFrom(src => JsonConvert.DeserializeObject<List<RelatedSpeaker>>(src.Speakers ?? string.Empty)));

            var entitiesVM = Mapper.Map<List<SessionEntry>, List<SessionViewModel>>(entitiesTable.ToList()); //neaparat cu ToList()

            return entitiesVM;
        }

        public IEnumerable<SessionEntry> GetAllEntries(String eventId)
        {
            var filter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, eventId);
            return this.ExecuteQuery(filter);
        }

        public void MergeEntities(IEnumerable<SessionEntry> entities)
        {
            this.MergeBatch(entities);
        }

        public SessionViewModel GetByKeys(String pk, String rk) //pk=EventId; rk=SessionId
        {

            var i = this.Retrieve(pk, rk);
            if (i == null) throw new HttpResponseException(HttpStatusCode.NotFound);


            // automapper: copy "entitiesTable" to "entitiesVM"
            Mapper.CreateMap<SessionEntry, SessionViewModel>()
                .ForMember(dest => dest.EventId, opt => opt.MapFrom(src => src.PartitionKey))
                .ForMember(dest => dest.SessionId, opt => opt.MapFrom(src => src.RowKey))
                .ForMember(dest => dest.Speakers, opt => opt.MapFrom(src => JsonConvert.DeserializeObject<List<RelatedSpeaker>>(src.Speakers ?? string.Empty)));

            var entityVM = Mapper.Map<SessionEntry, SessionViewModel>(i);

            return entityVM;        
        }

        public void UpdateProperty(string pk, string rk, string propertyName,  string propertyValue)
        {
            var f = new DynamicTableEntity();

            f.PartitionKey = pk;
            f.RowKey = rk;
            f.ETag = "*"; //neaparat

            f.Properties.Add(propertyName, new EntityProperty(propertyValue));

            var operation = TableOperation.Merge(f);
            Table.Execute(operation);
        }

        public void IncrementCurrentAttendees(string pk, string rk)
        {
            var entity = this.Retrieve(pk, rk);
            entity.CurrentAttendees = ++entity.CurrentAttendees;

            var operation = TableOperation.Merge(entity);
            Table.Execute(operation);
        }

        public void DecrementCurrentAttendees(string pk, string rk)
        {
            var entity = this.Retrieve(pk, rk);
            entity.CurrentAttendees = --entity.CurrentAttendees;

            var operation = TableOperation.Merge(entity);
            Table.Execute(operation);
        }
    }


    public interface ISessionRepository : ITableStorage<SessionEntry>
    {
        IEnumerable<SessionViewModel> GetByPk(String eventId);
        SessionViewModel GetByKeys(String pk, String rk);
        void UpdateProperty(string pk, string rk, string propertyName, string propertyValue);
        void IncrementCurrentAttendees(string pk, string rk);
        void DecrementCurrentAttendees(string pk, string rk);

        IEnumerable<SessionEntry> GetAllEntries(String eventId);
        void MergeEntities(IEnumerable<SessionEntry> entities);
    }
}