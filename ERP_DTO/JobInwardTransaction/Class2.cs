using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{
    public class CNV_NextNumber_DTO
    {
        public int Id { get; set; }
        public DateTime CNVDate { get; set; }
        public int NextNumber { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public int NumberOfDigits { get; set; }
        public bool PrefilZero { get; set; }
        public string FinalCNVNumber { get; set; }
        public int CreatorCode { get; set; }
    }
    public class JSO_NextNumber_DTO
    {
        public int Id { get; set; }
        public DateTime JSODate { get; set; }
        public int NextNumber { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public int NumberOfDigits { get; set; }
        public bool PrefilZero { get; set; }
        public string FinalJSONumber { get; set; }
        public int CreatorCode { get; set; }
    }
    public class JWI_NextNumber_DTO
    {
        public int Id { get; set; }
        public DateTime JWIDate { get; set; }
        public int NextNumber { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public int NumberOfDigits { get; set; }
        public bool PrefilZero { get; set; }
        public string FinalJWINumber { get; set; }
        public int CreatorCode { get; set; }
    }
    public class DN_NextNumber_DTO
    {
        public int Id { get; set; }
        public DateTime DNDate { get; set; }
        public int NextNumber { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public int NumberOfDigits { get; set; }
        public bool PrefilZero { get; set; }
        public string FinalDNNumber { get; set; }
        public int CreatorCode { get; set; }
    }
    public class RN_NextNumber_DTO
    {
        public int Id { get; set; }              // 101 = get next number
        public DateTime RNDate { get; set; }
        public int NextNumber { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public int NumberOfDigits { get; set; }
        public bool PrefilZero { get; set; }
        public string FinalRNNumber { get; set; }
        public int CreatorCode { get; set; }
    }
}
