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
    public class UserDetailsRepository : TableStorage<UserDetailEntry>, IUserDetailsRepository
    {
        public UserDetailsRepository()
            : base(tableName: "eta2u77UserDetails")
        {
        }


        public IEnumerable<UserDetailViewModel> GetAll(string eventId)
        {
            var filter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, eventId);
            var entitiesTable = this.ExecuteQuery(filter);

            // automapper: copy "entitiesTable" to "entitiesVM"
            Mapper.CreateMap<UserDetailEntry, UserDetailViewModel>()
                //.ForMember(dest => dest.EventId, opt => opt.MapFrom(src => src.PartitionKey))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.RowKey));


            var entitiesVM = Mapper.Map<List<UserDetailEntry>, List<UserDetailViewModel>>(entitiesTable.ToList()); //neaparat cu ToList()

            return entitiesVM;
        }

        public UserDetailViewModel Get(string eventId, string email)
        {
            var i = this.Retrieve(eventId, email);
            if (i == null) return null;


            // automapper: copy "entitiesTable" to "entitiesVM"
            Mapper.CreateMap<UserDetailEntry, UserDetailViewModel>()
                //.ForMember(dest => dest.EventId, opt => opt.MapFrom(src => src.PartitionKey))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.RowKey));

            var entityVM = Mapper.Map<UserDetailEntry, UserDetailViewModel>(i);

            return entityVM; 
        }

        public void Add(string eventId, UserDetailViewModel userDetail)
        {

            // automapper: copy "entitiesTable" to "entitiesVM"
            Mapper.CreateMap<UserDetailViewModel, UserDetailEntry>()
                .ForMember(dest => dest.PartitionKey, opt => opt.UseValue(eventId))
                .ForMember(dest => dest.RowKey, opt => opt.MapFrom(src => src.Email.ToLower()));

            var entity = Mapper.Map<UserDetailViewModel, UserDetailEntry>(userDetail);

            this.Insert(entity);

        }

        public void Delete(string eventId, string email)
        {
            var item = new UserDetailEntry();
            item.PartitionKey = eventId;
            item.RowKey = email.ToLower();
            this.Delete(item);

        }

    }

    public interface IUserDetailsRepository : ITableStorage<UserDetailEntry>
    {
        IEnumerable<UserDetailViewModel> GetAll(string eventId);
        UserDetailViewModel Get(string eventId, string email);
        void Add(string eventId, UserDetailViewModel userDetail);
        //void Update(UserDetailViewModel userDetail);
        void Delete(string eventId, string email);
    }
}