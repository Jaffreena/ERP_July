using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO
{
    public class JO_WorkCentre_DTO
    {
        public Int64 JWWC_Number { get; set; }

        [Display(Name = "JW Work Centre")]
        [Required(ErrorMessage = "JW Work Centre is Required")]
        [MaxLength(25, ErrorMessage = "JW Work Centre cannot be longer than 25 characters.")]
        public String? JWWC_JW_WorkCentre { get; set; }

        [Display(Name = "Description")]
        [MaxLength(100, ErrorMessage = "Description cannot be longer than 100 characters.")]
        public String? JWWC_Description { get; set; }

        [Display(Name = "Work Centre Group")]
        [Required(ErrorMessage = "Work Centre Group is Required")]
        public Int64 JWWC_JWCG_Number { get; set; }

        [Display(Name = "Warehouse")]
        [Required(ErrorMessage = "Warehouse is Required")]
        public Int64 JWWC_WH_Number { get; set; }

        [Display(Name = "Process Name")]
        [Required(ErrorMessage = "Process Name is Required")]
        public Int64 JWWC_JPRS_Number { get; set; }

        // List display only (from SP joins)
        public String? JWWC_WorkCentreGroup { get; set; }
        public String? JWWC_WarehouseName { get; set; }
        public String? JWWC_ProcessName { get; set; }

        public String? JWWC_DeleteNumbers { get; set; }

        public Int64 JWWC_CreatorCode { get; set; }

        public Int16 JWWC_Id { get; set; }

        public void Reset()
        {
            this.JWWC_Number = 0;
            this.JWWC_JW_WorkCentre = string.Empty;
            this.JWWC_Description = string.Empty;
            this.JWWC_JWCG_Number = 0;
            this.JWWC_WH_Number = 0;
            this.JWWC_JPRS_Number = 0;
            this.JWWC_DeleteNumbers = string.Empty;
            this.JWWC_CreatorCode = 0;
            this.JWWC_Id = 0;
        }
    }
}