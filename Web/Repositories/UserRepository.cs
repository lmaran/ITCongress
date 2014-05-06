using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace Web.Repositories
{
    public class UserRepository
    {
        public long getMaxId()
        {
            var connString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
            SqlConnection sqlConnection1 = new SqlConnection(connString);
            SqlCommand cmd = new SqlCommand();
            Object returnValue;

            cmd.CommandText = "SELECT max(Id2) FROM AspNetUsers";
            cmd.CommandType = CommandType.Text;
            cmd.Connection = sqlConnection1;

            sqlConnection1.Open();

            returnValue = cmd.ExecuteScalar();

            sqlConnection1.Close();
            return (long)returnValue;
        }
    }
}