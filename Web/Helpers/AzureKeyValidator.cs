//http://www.symbolsource.org/Public/Metadata/NuGet/Project/TechSmith.Hyde/2.1.0.0/Release/.NETFramework,Version%3Dv4.0/TechSmith.Hyde/TechSmith.Hyde/Table/Azure/AzureKeyValidator.cs?ImageName=TechSmith.Hyde
using System.Data.Services.Client;

namespace Web.Helpers
{
    internal class AzureKeyValidator
    {
        public static void ValidatePartitionKey(string partitionKey)
        {
            ValidateKeyLength(partitionKey);
            ValidateKeyCharacters(partitionKey);
        }

        public static void ValidateRowKey(string rowKey)
        {
            ValidateKeyLength(rowKey);
            ValidateKeyCharacters(rowKey);
        }

        private static void ValidateKeyCharacters(string key)
        {
            // based on requirements from Azure: http://msdn.microsoft.com/en-us/library/windowsazure/dd179338.aspx
            bool invalid = false;
            invalid |= key.Contains("/");
            invalid |= key.Contains("\\");
            invalid |= key.Contains("#");
            invalid |= key.Contains("?");

            if (invalid)
            {
                throw new DataServiceRequestException("Invalid key specified. Invalid characters in key");
            }
        }

        private static void ValidateKeyLength(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                throw new DataServiceRequestException("Invalid key specified. Key is null or empty.");
            }

            // based on requirements from Azure: http://msdn.microsoft.com/en-us/library/windowsazure/dd179338.aspx
            // keys are limited to 1024 bytes which equals 512 UTF16 characters
            if (key.Length > 512)
            {
                throw new DataServiceRequestException("Invalid key specified. Key length is above 512 characters.");
            }
        }
    }
}
