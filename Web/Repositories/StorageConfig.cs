//https://github.com/WindowsAzure-Samples/MyPictures

namespace Web.Repositories
{
    public static class StorageConfig
    {
        //public const string StorageAccount = "WAZStorageAccount";
        public static readonly long TopBigNumber = 98975464; //100 milioane blob-uri/container sau tablerow-uri/table (8ch.=128 bit)
        public static readonly string BlobContainer = "upf" + "98574".PadLeft(5, '0') + "file";  //"HostAppCode(3) + GuestAppId(5) + HostEntityName;
        public static readonly string BlobSizesContainer = "upf" + "98574".PadLeft(5, '0') + "size";  //"HostAppCode(3) + GuestAppId(5) + HostEntityName;
        public static readonly string FilesTblName = "upf" + "98574".PadLeft(5, '0') + "file";  //"HostAppCode(3) + GuestAppId(5) + HostEntityName;
        //public const string TagsTable = "MyPicturesTags";
        //public const string PictureTagTable = "MyPicturesPictureTag";
    }
}