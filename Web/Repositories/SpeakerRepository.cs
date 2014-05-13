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
    public class SpeakerRepository : TableStorage<SpeakerEntry>, ISpeakerRepository
    {
        public SpeakerRepository()
            : base(tableName: "eta2u77Speakers")
        {
        }


        public IEnumerable<SpeakerViewModel> GetByPk(String eventId)
        {
            var filter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, eventId);
            var entitiesTable = this.ExecuteQuery(filter);

            // automapper: copy "entitiesTable" to "entitiesVM"
            Mapper.CreateMap<SpeakerEntry, SpeakerViewModel>()
                .ForMember(dest => dest.EventId, opt => opt.MapFrom(src => src.PartitionKey))
                .ForMember(dest => dest.SpeakerId, opt => opt.MapFrom(src => src.RowKey));
                

            var entitiesVM = Mapper.Map<List<SpeakerEntry>, List<SpeakerViewModel>>(entitiesTable.ToList()); //neaparat cu ToList()

            return entitiesVM;
        }

        public SpeakerViewModel GetByKeys(String pk, String rk) //pk=EventId; rk=SessionId
        {

            var i = this.Retrieve(pk, rk);
            if (i == null) throw new HttpResponseException(HttpStatusCode.NotFound);


            // automapper: copy "entitiesTable" to "entitiesVM"
            Mapper.CreateMap<SpeakerEntry, SpeakerViewModel>()
                .ForMember(dest => dest.EventId, opt => opt.MapFrom(src => src.PartitionKey))
                .ForMember(dest => dest.SpeakerId, opt => opt.MapFrom(src => src.RowKey));

            var entityVM = Mapper.Map<SpeakerEntry, SpeakerViewModel>(i);

            return entityVM;        
        }


    }


    public interface ISpeakerRepository : ITableStorage<SpeakerEntry>
    {
        IEnumerable<SpeakerViewModel> GetByPk(String eventId);
        SpeakerViewModel GetByKeys(String pk, String rk);
    }
}