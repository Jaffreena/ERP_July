using System;

namespace ERP_DTO.JobOutwardTransaction
{
    // next RN number (on date change)
    public class JO_RN_NextNumber_DTO
    {
        public int Id { get; set; }
        public DateTime RNDate { get; set; }
        public int CreatorCode { get; set; }
        public string FinalRNNumber { get; set; } = "";
    }

    // running number (after Save) + numbering setup screen
    public class JORNNumber_DTO
    {
        public int Id { get; set; }
        public int RNN_Number { get; set; }
        public string? RNN_Method { get; set; }
        public string? RNN_Date { get; set; }
        public string? RNN_EndDate { get; set; }
        public string? RNN_StartingNumber { get; set; }
        public string? RNN_NumberofDigits { get; set; }
        public string? RNN_PrefilZero { get; set; }
        public string? RNN_Frequency { get; set; }
        public string? RNN_Particulars { get; set; }
        public string? DeleteNumbers { get; set; }
        public int CreatorCode { get; set; }
    }
}