<?php

namespace App\Models;

use App\Enums\Attestation;
use App\Enums\CalculationHeatTreatmentType;
use App\Enums\HweOfferPosGroupType;
use App\Enums\NonDestructiveTesting;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class OfferPos extends Model implements HasMedia
{
    use InteractsWithMedia {
        media as protected trait_media;
    }

    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function calculation(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Calculation::class);
    }

    #[LodataRelationship]
    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    #[LodataRelationship]
    public function material(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    #[LodataRelationship]
    public function offerPosRawDimensions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OfferPosRawDimension::class);
    }

    #[LodataRelationship]
    public function mechanicalProcesses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OfferPosMechanicalProcess::class);
    }

    #[LodataRelationship]
    public function offerPosCosts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OfferPosCost::class);
    }

    #[LodataRelationship]
    public function item(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    #[LodataRelationship]
    public function tool(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    #[LodataRelationship]
    public function tool_2(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Tool::class, 'tool_id_2');
    }

    #[LodataRelationship]
    public function tool_3(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Tool::class, 'tool_id_3');
    }

    #[LodataRelationship]
    public function copyForm(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(OfferPos::class, 'offer_pos_id_copy_from');
    }


    public function generateText4()
    {
        $text = '';
        $text .= $this->getTextSummarySpecification(); //Section 3 - Line 1
        $text .= '\n'; //Paragraph
        $text .= '';  //Section 3 - Line 2
        $text .= '\n'; //Paragraph
        $text .= $this->getTextCertification();  //Section 3 - Line 3/4
        return $text;
    }

    public function getTextSummarySpecification()
    {
        $text = '';

        if ($this->calculation) {
            if ($this->calculation->specification && $this->calculation->specification->id) {
                $text .= "\n" . trans('hwekalkOfferSummary.mainContent.conditional_text.design_according_spec') . '.. ' . $this->calculation->specification->name . "\n";
            }
            if ($this->calculation->calculationDocumentation && $this->calculation->calculationDocumentation->offer_note) {
                $text .= "\n" . $this->calculation->calculationDocumentation->offer_note . "\n";
            }
            if ($this->calculation->calculationMetallography && $this->calculation->calculationMetallography->offer_note) {
                $text .= "\n" . $this->calculation->calculationMetallography->offer_note . "\n";
            }
            if ($this->calculation->calculationTestingScope && $this->calculation->calculationTestingScope->offer_note) {
                $text .= "\n" . $this->calculation->calculationTestingScope->offer_note . "\n";
            }
            if ($this->calculation->calculationNonDestructiveTesting && $this->calculation->calculationNonDestructiveTesting->offer_note) {
                $text .= "\n" . $this->calculation->calculationNonDestructiveTesting->offer_note . "\n";
            }
            if ($this->calculation->calculationResidualMaterial && $this->calculation->calculationResidualMaterial->offer_note) {
                $text .= "\n" . $this->calculation->calculationResidualMaterial->offer_note . "\n";
            }
        }

        return $text;
    }

    public function getTextCertification()
    {
        $text = '';

        if ($this->calculation) {
            if ($this->calculation->calculationTestingScope && $this->calculation->calculationTestingScope->attestation) {
                $text .= trans('hwekalkOfferSummary.mainContent.conditional_text.inspection_certificate_according') . ' ' . trans('hwekalkOfferSummary.enums.' . $this->calculation->calculationTestingScope->attestation);

                if ($this->calculation->calculationTestingScope->attestationEntities && sizeof($this->calculation->calculationTestingScope->attestationEntities) > 0) {
                    $text .= '\n' . trans('hwekalkOfferSummary.mainContent.conditional_text.through') . ' ';

                    $result = array_reduce(
                        $this->calculation->calculationTestingScope->attestationEntities->toArray(),
                        function ($acc, $current) {
                            $value = is_array($current) ? ($current['name'] ?? 'Unknown') : ($current->name ?? 'Unknown');
                            return $acc === '' ? $value : $acc . ', ' . $value;
                        }, ''
                    );

                    $text .= $result;
                }

                $check = !($this->calculation->specification && $this->calculation->specification->id) && !(
                        $this->calculation->documentation ||
                        $this->calculation->metallography ||
                        $this->calculation->testingScope ||
                        $this->calculation->nonDestructiveTesting ||
                        $this->calculation->materialAnalysis ||
                        $this->calculation->deformation ||
                        $this->calculation->residualMaterial ||
                        $this->calculation->hweWorkPlan);

                if ($this->calculation->calculationTestingScope->attestation_following_regulation) {
                    $text .= '\n' . trans('hwekalkOfferSummary.mainContent.conditional_text.according_above_spec');
                } else if ($check) {
                    if ($this->calculation->charge) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.charge');
                        if ($this->calculation->melting_process) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.with_melting_process');
                        }
                    }

                    if ($this->calculation->cleanliness_of_the_charge) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.purity_of_the_batch');
                    }

                    if ($this->calculation->grainsize_of_the_charge) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.batch_grain_size');
                    }

                    if ($this->calculation->deformation) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.degree_of_deformation');
                    }

                    if ($this->calculation->heattreamtment) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.heat_treatment_data');
                        if ($this->calculation->heattreamtment_with_diagram) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.with_oven_diagram');
                        }
                    }

                    if ($this->calculation->jominy) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.forehead_quenching_test');
                    }

                    if ($this->calculation->hardness_testing_hbw) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.hbw_hardness_test');
                        if ($this->calculation->conversion_acc_iso_18265_table_a_1) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.conversion') . ' n. ISO 18265 ' . trans('hwekalkOfferSummary.mainContent.conditional_text.table') . ' A.1';
                        }
                        if ($this->calculation->conversion_acc_iso_18265_table_b_2) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.conversion') . ' n. ISO 18265 ' . trans('hwekalkOfferSummary.mainContent.conditional_text.table') . ' B.2';
                        }
                    }

                    if ($this->calculation->hardness_testing_hbw_per_piece) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.hardness_test_hbw_peice');
                        if ($this->calculation->conversion_acc_iso_18265_table_a_1) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.conversion') . ' n. ISO 18265 ' . trans('hwekalkOfferSummary.mainContent.conditional_text.table') . ' A.1';
                        }
                        if ($this->calculation->conversion_acc_iso_18265_table_b_2) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.conversion') . ' n. ISO 18265 ' . trans('hwekalkOfferSummary.mainContent.conditional_text.table') . ' B.2';
                        }
                    }

                    if ($this->calculation->individualNonDestructiveTesting && $this->calculation->individualNonDestructiveTesting->usNorm) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.us_test_per_piece');
                        if ($this->calculation->individualNonDestructiveTesting->usNorm->custom_id) {
                            $text .= $this->calculation->calculationNonDestructiveTesting->usNorm->custom_id;
                        }

                        if ($this->calculation->individualNonDestructiveTesting->non_destructive_testing == NonDestructiveTesting::THREE_TWO() && $this->calculation->individualNonDestructiveTesting->attestationEntities && $this->calculation->individualNonDestructiveTesting->attestationEntities != []) {
                            $result = array_reduce(
                                $this->calculation->individualNonDestructiveTesting->attestationEntities->toArray(),
                                function ($acc, $current) {
                                    $value = is_array($current) ? ($current['name'] ?? 'Unknown') : ($current->name ?? 'Unknown');
                                    return $acc === '' ? $value : $acc . ', ' . $value;
                                }, ''
                            );

                            $text .= ' (3.2-Abn. ' . trans('hwekalkOfferSummary.mainContent.conditional_text.by') . '"' . $result . '")';
                        }
                    }

                    if ($this->calculation->individualNonDestructiveTesting && $this->calculation->individualNonDestructiveTesting->mtNorm) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.or_test_per_piece');
                        if ($this->calculation->individualNonDestructiveTesting->mtNorm->custom_id) {
                            $text .= $this->calculation->individualNonDestructiveTesting->mtNorm->custom_id;
                        }
                    }

                    if ($this->calculation->pmi) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.identity_check');
                    }

                    if ($this->calculation->visual_inspection) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.visual_inspection');
                    }

                    if ($this->calculation->dimension_control) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.dimentional_check');
                    }

                    if ($this->calculation->dimension_protocol) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.measurement_protocol');
                    }

                    if ($this->calculation->concentricity_check) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.concentricity_control');
                    }

                    if ($this->calculation->radioactivity_freedom_confirmation) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.confirmaiton_freedom_radioactivity');
                    }

                    if ($this->calculation->residual_magnetic_field_strength) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.specification_magnet_residual_field_strength');
                    }
                } else {
                    //     Data from XLS Abnahmeumfang bei Beurteilung
                    if ($this->calculation->calculationDocumentation && $this->calculation->calculationDocumentation->charge) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.charge');
                        if ($this->calculation->calculationDocumentation->melting_process) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.charge');
                        }
                    }

                    if ($this->calculation->calculationTestingScope) {
                        if ($this->calculation->calculationTestingScope->zug) {
                            $text .= '\n- ' . $this->calculation->calculationTestingScope->zug . trans('hwekalkOfferSummary.mainContent.conditional_text.tensile_test_rt');
                        }

                        if ($this->calculation->calculationTestingScope->zug_gt_40) {
                            $text .= '\n- ' . $this->calculation->calculationTestingScope->zug_gt_40 . trans('hwekalkOfferSummary.mainContent.conditional_text.hot_tensile_test_at') . ' > 40 °C';
                        }

                        if ($this->calculation->calculationTestingScope->zug_300) {
                            $text .= '\n- ' . $this->calculation->calculationTestingScope->zug_300 . trans('hwekalkOfferSummary.mainContent.conditional_text.hot_tensile_test_at') . ' 300 °C';
                        }

                        if ($this->calculation->calculationTestingScope->kbz) {
                            $text .= '\n- ' . $this->calculation->calculationTestingScope->kbz . ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.notched_bar_impact_test_at') . ' RT';
                        }

                        if ($this->calculation->calculationTestingScope->kbz_p_20) {
                            $text .= '\n- ' . $this->calculation->calculationTestingScope->kbz_p_20 . ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.notched_bar_impact_test_at') . ' 20°C';
                        }

                        if ($this->calculation->calculationTestingScope->kbz_0) {
                            $text .= '\n- ' . $this->calculation->calculationTestingScope->kbz_0 . ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.notched_bar_impact_test_at') . ' 0°C';
                        }

                        if ($this->calculation->calculationTestingScope->kbz_m_20) {
                            $text .= '\n- ' . $this->calculation->calculationTestingScope->kbz_m_20 . ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.notched_bar_impact_test_at') . ' -20°C';
                        }

                        if ($this->calculation->calculationTestingScope->kbz_m_50) {
                            $text .= '\n- ' . $this->calculation->calculationTestingScope->kbz_m_50 . ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.notched_bar_impact_test_at') . ' -50°C';
                        }

                        if ($this->calculation->calculationTestingScope->kbz_m_60) {
                            $text .= '\n- ' . $this->calculation->calculationTestingScope->kbz_m_60 . ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.notched_bar_impact_test_at') . ' -60°C';
                        }
                    }

                    if ($this->calculation->calculationDocumentation) {
                        if ($this->calculation->calculationDocumentation->cleanliness_of_the_charge) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.purity_of_the_batch');
                        }

                        if ($this->calculation->calculationDocumentation->cleanliness_of_the_component) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.determining_purity_piece');
                        }

                        if ($this->calculation->calculationDocumentation->grainsize_of_the_charge) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.batch_grain_size');
                        }

                        if ($this->calculation->calculationDocumentation->grainsize_of_the_component) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.grain_size_determination_piece');
                        }

                        if ($this->calculation->calculationDocumentation->product_analysis) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.piece_analysis');
                        }

                        if ($this->calculation->calculationDocumentation->deformation) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.degree_of_deformation');
                        }

                        if ($this->calculation->calculationDocumentation->heattreamtment) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.heat_treatment_data');
                            if ($this->calculation->calculationDocumentation->heattreamtment_with_diagram) {
                                $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.with_oven_diagram');
                            }
                        }

                        if ($this->calculation->calculationDocumentation->jominy) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.forehead_quenching_test');
                        }
                    }

                    if ($this->calculation->calculationMetallography) {
                        $isValid = $this->calculation->calculationMetallography->needs_microsection_structure ||
                            $this->calculation->calculationMetallography->needs_microsection_grain_size ||
                            $this->calculation->calculationMetallography->needs_microsection_carburized ||
                            $this->calculation->calculationMetallography->needs_microsection_cleanliness ||
                            $this->calculation->calculationMetallography->microstructure_quota;

                        if ($isValid) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.structural_assessment');
                        }

                        if ($this->calculation->calculationMetallography->needs_ic_according_to) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.corrosion_test_according_to') . ' ' . trans('hwekalkOfferSummary.enums.' . $this->calculation->calculationMetallography->needs_ic_according_to);
                        }
                    }

                    if ($this->calculation->calculationDocumentation && $this->calculation->calculationDocumentation->hardness_testing_hbw) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.hbw_hardness_test');
                        if ($this->calculation->calculationDocumentation->conversion_acc_iso_18265_table_a_1) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.conversion') . ' n. ISO 18265 ' . trans('hwekalkOfferSummary.mainContent.conditional_text.table') . ' A.1';
                        }
                        if ($this->calculation->calculationDocumentation->conversion_acc_iso_18265_table_b_2) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.conversion') . ' n. ISO 18265 ' . trans('hwekalkOfferSummary.mainContent.conditional_text.table') . ' B.2';
                        }
                    }

                    if ($this->calculation->calculationDocumentation && $this->calculation->calculationDocumentation->hardness_testing_hbw_per_piece) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.hardness_test_hbw_peice');
                        if ($this->calculation->calculationDocumentation->conversion_acc_iso_18265_table_a_1) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.conversion') . ' n. ISO 18265 ' . trans('hwekalkOfferSummary.mainContent.conditional_text.table') . ' A.1';
                        }
                        if ($this->calculation->calculationDocumentation->conversion_acc_iso_18265_table_b_2) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.conversion') . ' n. ISO 18265 ' . trans('hwekalkOfferSummary.mainContent.conditional_text.table') . ' B.2';
                        }
                    }

                    if ($this->calculation->calculationNonDestructiveTesting) {
                        if ($this->calculation->calculationNonDestructiveTesting->usNorm) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.hardness_test_hbw_peice');
                            if ($this->calculation->calculationNonDestructiveTesting->usNorm->custom_id) {
                                $text .= $this->calculation->calculationNonDestructiveTesting->usNorm->custom_id;
                            }

                            if ($this->calculation->calculationNonDestructiveTesting->non_destructive_testing == NonDestructiveTesting::THREE_TWO() && $this->calculation->calculationNonDestructiveTesting->attestationEntities && $this->calculation->calculationNonDestructiveTesting->attestationEntities != []) {
                                $result = array_reduce(
                                    $this->calculation->calculationNonDestructiveTesting->attestationEntities->toArray(),
                                    function ($acc, $current) {
                                        $value = is_array($current) ? ($current['name'] ?? 'Unknown') : ($current->name ?? 'Unknown');
                                        return $acc === '' ? $value : $acc . ', ' . $value;
                                    }, ''
                                );

                                $text .= ' (3.2-Abn. ' . trans('hwekalkOfferSummary.mainContent.conditional_text.by') . '"' . $result . '")';
                            }
                        }

                        if ($this->calculation->calculationNonDestructiveTesting->mtNorm) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.or_test_per_piece');
                            if ($this->calculation->calculationNonDestructiveTesting->mtNorm->custom_id) {
                                $text .= $this->calculation->calculationNonDestructiveTesting->mtNorm->custom_id;
                            }
                        }
                    }

                    if ($this->calculation->calculationDocumentation) {
                        if ($this->calculation->calculationDocumentation->pmi) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.identity_check');
                        }

                        if ($this->calculation->calculationDocumentation->visual_inspection) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.visual_inspection');
                        }

                        if ($this->calculation->calculationDocumentation->dimension_control) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.dimentional_check');
                        }

                        if ($this->calculation->calculationDocumentation->dimension_protocol) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.measurement_protocol');
                        }

                        if ($this->calculation->calculationDocumentation->concentricity_check) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.concentricity_control');
                        }

                        if ($this->calculation->calculationDocumentation->radioactivity_freedom_confirmation) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.confirmaiton_freedom_radioactivity');
                        }

                        if ($this->calculation->calculationDocumentation->residual_magnetic_field_strength) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.specification_magnet_residual_field_strength');
                        }

                        if ($this->calculation->calculationDocumentation->confirmation_of_the_absence_of_flakes) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.confirmaiton_freedom_flakes');
                        }

                        if ($this->calculation->calculationDocumentation->initial_inspection) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.initial_sample_inspection');
                        }
                    }

                    if ($this->calculation->calculationTestingScope) {
                        if ($this->calculation->calculationTestingScope->test_blue_structure) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.blue_break_sample');
                        }

                        if ($this->calculation->calculationTestingScope->test_baumann_imprint) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.bauman_experiment');
                        }

                        if ($this->calculation->calculationTestingScope->specimen_rest_material) {
                            $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.residual_sample_material_supplied');
                        }
                    }

                    if ($this->calculation->calculationResidualMaterial) {
                        $text .= '\n- ' . trans('hwekalkOfferSummary.mainContent.conditional_text.sample_material_supplied');
                        if ($this->calculation->calculationResidualMaterial->specification) {
                            $text .= ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.to') . ' ' . $this->calculation->calculationResidualMaterial->specification;
                        }
                        if ($this->calculation->calculationResidualMaterial->frequency) {
                            $text .= '\n ' . trans('hwekalkOfferSummary.enums.' . $this->calculation->calculationResidualMaterial->frequency);
                        }
                        if ($this->calculation->calculationResidualMaterial->quantity_sample_geometries) {
                            $text .= $this->calculation->calculationResidualMaterial->quantity_sample_geometries;
                        }
                        if ($this->calculation->calculationResidualMaterial->free_text) {
                            $text .= $this->calculation->calculationResidualMaterial->free_text;
                        }
                    }
                }
            } else if ($this->calculation->attestation) {
                $text .= '\n' . trans('hwekalkOfferSummary.mainContent.conditional_text.with_works_certificate_accordance_with') . ' ' . trans('hwekalkOfferSummary.enums.' . $this->calculation->attestation);
            } else {
                $exists = false;
                if ($this->calculation->heatTreatments) {
                    foreach ($this->calculation->heatTreatments as $item) {
                        if (!$item->isDeleted && $item->type !== CalculationHeatTreatmentType::UNTREATED()) {
                            $exists = true;
                            break;
                        }
                    }
                }

                if ($this->calculation->attestation === Attestation::EN_10204_3_1() && $exists) {
                    $text .= trans('hwekalkOfferSummary.mainContent.conditional_text.with_works_certificate_accordance_with') . ' ' . trans('hwekalkOfferSummary.enums.' . $this->calculation->attestation) . trans('hwekalkOfferSummary.mainContent.conditional_text.via') . '\n' . trans('hwekalkOfferSummary.mainContent.conditional_text.chem_analysis') . ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.and') . ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.hb_test');
                } else if ($exists) {
                    $text .= trans('hwekalkOfferSummary.mainContent.conditional_text.with_works_certificate_accordance_with') . ' DIN 10204/2.2 ' . trans('hwekalkOfferSummary.mainContent.conditional_text.via') . '\n' . trans('hwekalkOfferSummary.mainContent.conditional_text.chem_analysis') . ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.and') . ' ' . trans('hwekalkOfferSummary.mainContent.conditional_text.hb_test');
                } else {
                    $text .= trans('hwekalkOfferSummary.mainContent.conditional_text.with_works_certificate_accordance_with') . ' DIN 10204/2.2 ' . trans('hwekalkOfferSummary.mainContent.conditional_text.via') . '\n' . trans('hwekalkOfferSummary.mainContent.conditional_text.chem_analysis') . '\n';
                }
            }
        }

        return $text;
    }

    public function getCost() {
        $cost = 0;
        foreach ($this->offerPosCosts as $offerPosCost) {
            $cost += $offerPosCost->cost;
        }
        return $cost;
    }

    public function getCostGroupByData($costs) {
		$groups = [];
        $groupConfig = [
			[
				'include' => [HweOfferPosGroupType::MATERIAL(), HweOfferPosGroupType::OPERATION()],
				'name' => __('messages.hwekalkOfferSummary.mainContent.sub_total') . ' 1',
            ],
			[
				'include' => [HweOfferPosGroupType::ADDITIONAL()],
				'name' => __('messages.hwekalkOfferSummary.mainContent.sub_total') . ' 2',
            ],
			[
				'include' => [
					HweOfferPosGroupType::OVERHEAD(),
					HweOfferPosGroupType::PACKAGING(),
					HweOfferPosGroupType::FREIGHT(),
				],
				'name' => __('messages.hwekalkOfferSummary.mainContent.sub_total') . ' 3',
            ],
			[
				'include' => [HweOfferPosGroupType::DISCOUNT()],
				'name' => __('messages.hwekalkOfferSummary.mainContent.sub_total') . ' 4',
            ],
			[
				'include' => [HweOfferPosGroupType::MANUAL()],
				'name' => "",
            ],
        ];

        for ($i = 0; $i < sizeof($groupConfig); $i++) {
            $config = $groupConfig[$i];
			$items = array_filter(
                $costs ?? [],
                function ($cost) use ($config) {
                    return in_array($cost['group_type'], $config['include']);
                }
            );
            
			if (sizeof($items)) {
				$previousCost = $groups[sizeof($groups) - 1]['costSum'] ?? 0;
				$previousLead = $groups[sizeof($groups) - 1]['leadSum'] ?? 0;
                $temp = [
					'name' => $config['name'],
					'items' => $items,
					'costSum' => $this->sumCosts($items) + $previousCost,
					'leadSum' => $this->sumLeadTimes($items) + $previousLead,
				];
                array_push($groups, $temp);
			}
		}

		if(sizeof($groups) > 0) {
            $groups[sizeof($groups) - 1]['name'] = __('messages.hwekalkOfferSummary.mainContent.total_amount');
        }
		return $groups;
    }

    public function sumCosts(array $costs): float {
        return array_reduce($costs, function ($sum, $cost) {
            return $sum + ($cost['cost'] ?? 0);
        }, 0);
    }
    
    public function sumLeadTimes(array $costs): int {
        return array_reduce($costs, function ($sum, $cost) {
            return $sum + ($cost['lead_time_days'] ?? 0);
        }, 0);
    }
    
}
