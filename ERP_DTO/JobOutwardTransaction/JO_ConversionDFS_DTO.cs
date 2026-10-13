using System.ComponentModel.DataAnnotations;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JO_ConversionDFS_DTO
    {
        public long JOCNV_DFS_Number { get; set; }

        [Display(Name = "Material Segregation")]
        public long JOCNV_DFS_MS_Number { get; set; }

        [Display(Name = "Shift")]
        public long JOCNV_DFS_JSFT_Number { get; set; }

        [Display(Name = "Process")]
        public long JOCNV_DFS_JPRS_Number { get; set; }

        [Display(Name = "Work Centre")]
        public long JOCNV_DFS_JWWC_Number { get; set; }

        public int Result_Number { get; set; }
        public string? Result_Message { get; set; }
    }
}
