using Web.Helpers;
using Web.Models;
using Web.ViewModels;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.WindowsAzure.Storage.Table;

namespace Web.Repositories
{
    public class EventRepository : TableStorage<EventEntry>, IEventRepository
    {
        public EventRepository()
            : base(tableName: "eta2u77Events")
        {
        }


        public IEnumerable<EventViewModel> GetAll()
        {
            var filter = "";
            var entitiesTable = this.ExecuteQuery(filter);

            // automapper: copy "entitiesTable" to "entitiesVM"
            Mapper.CreateMap<EventEntry, EventViewModel>()
                .ForMember(dest => dest.EventYear, opt => opt.MapFrom(src => src.PartitionKey))
                .ForMember(dest => dest.EventId, opt => opt.MapFrom(src => src.RowKey));

            var entitiesVM = Mapper.Map<List<EventEntry>, List<EventViewModel>>(entitiesTable.ToList()); //neaparat cu ToList()

            return entitiesVM;
        }

    }

    public interface IEventRepository : ITableStorage<EventEntry>
    {
        IEnumerable<EventViewModel> GetAll();
    }
}