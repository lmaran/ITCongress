using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;

namespace ImportWhiteList
{
    class Program
    {
        // import a list of email that are approved by default
        static void Main(string[] args)
        {
            Console.WriteLine("All existing data will be deleted. Are you sure you want to continue? (y/n)");
            //var ch = Console.ReadKey(true);
            //if (ch.KeyChar == 'y' || ch.KeyChar == 'Y')
            //{
                Console.WriteLine("Starting import data...");



                //var connString = ConfigurationManager.AppSettings["Solution4AzureStorage"];
                //var storageAccount = CloudStorageAccount.Parse(connString);
                //var tableClient = storageAccount.CreateCloudTableClient();

                //CloudTable Table = tableClient.GetTableReference("WhiteList2014");
                //Table.CreateIfNotExists();


                int counter = 0;
                string line;
                var list = new List<string>();

                // Read the file and display it line by line.
                System.IO.StreamReader file = new System.IO.StreamReader("c:\\WhiteList2014.txt");
                while ((line = file.ReadLine()) != null)
                {
                    //Console.WriteLine(line);
                    list.Add(line);
                    counter++;

                }

                file.Close();

                for (var i = 0; i < 5; i++)
                {
                    Console.WriteLine(list[i]);
                }

                // Suspend the screen.
                //Console.ReadLine();
            //}
        }
    }
}
