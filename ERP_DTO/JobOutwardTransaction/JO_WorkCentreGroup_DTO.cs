using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JO_WorkCentreGroup_DTO
    {
        public Int64 JWCG_Number { get; set; }

        [Display(Name = "JW Work Centre Group")]
        [Required(ErrorMessage = "JW Work Centre Group is Required")]
        [MaxLength(25, ErrorMessage = "JW Work Centre Group should not be longer than 25 characters.")]
        public String? JWCG_JW_WorkCentreGroup { get; set; }

        [Display(Name = "Description")]
        [MaxLength(100, ErrorMessage = "Description should not be longer than 100 characters.")]
        public String? JWCG_Description { get; set; }

        // List: parent name / "Primary"  |  Form: parent Number (0 = Primary)
        [Display(Name = "Under")]
        [Required(ErrorMessage = "Under is Required")]
        public String? JWCG_Under_JWCG_Number { get; set; }

        public String? JWCG_DeleteNumbers { get; set; }

        public Int64 JWCG_CreatorCode { get; set; }

        public Int16 JWCG_Id { get; set; }

        public void Reset()
        {
            this.JWCG_Number = 0;
            this.JWCG_JW_WorkCentreGroup = string.Empty;
            this.JWCG_Description = string.Empty;
            this.JWCG_Under_JWCG_Number = string.Empty;
            this.JWCG_DeleteNumbers = string.Empty;
            this.JWCG_CreatorCode = 0;
            this.JWCG_Id = 0;
        }
    }
}
